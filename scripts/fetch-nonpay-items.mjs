/**
 * Fill MRI nonpay item names onto the existing snapshot.
 * Usage: node scripts/fetch-nonpay-items.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HIRA_KEY_A, HIRA_KEY_B } from "../lib/hira-keys.js";
import { loadEnv, root } from "./load-env.mjs";

loadEnv();

const KEY = process.env.HIRA_KEY_B || process.env.HIRA_KEY_A || HIRA_KEY_B || HIRA_KEY_A;
if (!KEY) {
  console.error("HIRA_KEY_B is required");
  process.exit(1);
}

const NONPAY =
  "https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/getNonPaymentItemHospDtlList";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function asList(items) {
  if (!items) return [];
  const item = items.item ?? items;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function isMriName(s) {
  return /MRI|자기공명|엠아르아이|MRA/i.test(String(s || ""));
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function itemsFor(ykiho) {
  const encoded = encodeURIComponent(ykiho);
  const out = [];
  const seen = new Set();
  let page = 1;
  let pages = 1;
  while (page <= pages) {
    const json = await getJson(
      `${NONPAY}?serviceKey=${KEY}&ykiho=${encoded}&pageNo=${page}&numOfRows=100&_type=json`
    );
    const body = json?.response?.body;
    const total = Number(body?.totalCount || 0);
    const rows = Number(body?.numOfRows || 100) || 100;
    pages = Math.max(1, Math.ceil(total / rows));
    for (const row of asList(body?.items)) {
      const name = String(row.npayKorNm || row.yadmNpayCdNm || "").trim();
      if (!name || !isMriName(name) || seen.has(name)) continue;
      seen.add(name);
      const amt = Number(row.curAmt);
      out.push({
        name,
        price: Number.isFinite(amt) && amt > 0 ? `${Math.round(amt).toLocaleString("ko-KR")}원` : undefined,
      });
    }
    page += 1;
    if (page <= pages) await sleep(120);
  }
  return out;
}

const snapshotPath = path.join(root, "data/hospitals.json");
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const hospitals = snapshot.hospitals;
console.log(`fetching MRI nonpay items for ${hospitals.length} hospitals`);

for (let i = 0; i < hospitals.length; i++) {
  const hospital = hospitals[i];
  try {
    const items = await itemsFor(hospital.ykiho);
    hospital.mriNonpayItems = items;
    if (items.length) hospital.hasMriNonpay = true;
    else if (hospital.hasMriNonpay !== "unknown") hospital.hasMriNonpay = false;
    console.log(`${i + 1}/${hospitals.length} ${hospital.name} → ${items.length}`);
  } catch (err) {
    hospital.mriNonpayItems = hospital.mriNonpayItems || [];
    console.warn(`${i + 1}/${hospitals.length} ${hospital.name} failed:`, err instanceof Error ? err.message : err);
  }
  await sleep(80);
}

await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
console.log(`saved ${snapshotPath}`);
