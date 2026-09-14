/**
 * HIRA snapshot builder for 이어(IEO).
 * Usage: HIRA_KEY_A=... HIRA_KEY_B=... node scripts/fetch-snapshot.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KEY_A = process.env.HIRA_KEY_A || process.env.HIRA_SERVICE_KEY;
const KEY_B = process.env.HIRA_KEY_B || KEY_A;
if (!KEY_A) {
  console.error("HIRA_KEY_A is required");
  process.exit(1);
}

const HOSP = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";
const DTL = "https://apis.data.go.kr/B551182/MadmDtlInfoService2.8";
const NONPAY =
  "https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/getNonPaymentItemHospDtlList";

const SIDO = "250000";
const DISTRICTS = [
  { id: "yuseong", label: "유성구", sgguCd: "250001" },
  { id: "daedeok", label: "대덕구", sgguCd: "250002" },
  { id: "seogu", label: "서구", sgguCd: "250003" },
  { id: "donggu", label: "동구", sgguCd: "250004" },
  { id: "junggu", label: "중구", sgguCd: "250005" },
];
const CL_CODES = ["01", "11", "21", "28", "31"];
const MRI = "B301";
const ORTHO = "05";

const EVIDENCE = {
  F1: "MRI 장비와 정형외과 진료가 확인되어 검사 가능성이 높습니다.",
  F2: "MRI 장비와 MRI 관련 비급여 항목 공개가 확인되어 검사 가능성이 높습니다.",
  F3: "MRI 장비는 확인됐지만 정형외과·비급여 정보가 부족해 전화로 확인이 필요합니다.",
  F4: "MRI 장비는 확인됐지만 실제 검사 가능 여부는 의료기관에 확인이 필요합니다.",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function asList(items) {
  if (!items) return [];
  const item = items.item ?? items;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function paged(buildUrl) {
  const first = await getJson(buildUrl(1));
  const body = first?.response?.body;
  const total = Number(body?.totalCount || 0);
  const rows = Number(body?.numOfRows || 100);
  let all = asList(body?.items);
  const pages = Math.max(1, Math.ceil(total / rows));
  for (let p = 2; p <= pages; p++) {
    await sleep(120);
    const json = await getJson(buildUrl(p));
    all = all.concat(asList(json?.response?.body?.items));
  }
  return all;
}

function careLevel(clCd) {
  const code = String(clCd);
  if (code === "01") return 1;
  if (code === "11" || code === "21") return 2;
  if (code === "31") return 3;
  return 0;
}

function judge({ hasOrtho, hasMriNonpay }) {
  if (hasOrtho === true) {
    return { status: "high", evidenceId: "F1", evidence: EVIDENCE.F1 };
  }
  if (hasMriNonpay === true) {
    return { status: "high", evidenceId: "F2", evidence: EVIDENCE.F2 };
  }
  if (hasOrtho === "unknown" || hasMriNonpay === "unknown") {
    return { status: "unknown", evidenceId: "F4", evidence: EVIDENCE.F4 };
  }
  return { status: "unknown", evidenceId: "F3", evidence: EVIDENCE.F3 };
}

function isMriName(s) {
  const t = String(s || "");
  return /MRI|자기공명|엠아르아이/i.test(t);
}

async function fetchHospitals() {
  const map = new Map();
  for (const district of DISTRICTS) {
    for (const clCd of CL_CODES) {
      const extra = clCd === "31" ? `&dgsbjtCd=${ORTHO}` : "";
      const rows = await paged(
        (page) =>
          `${HOSP}?serviceKey=${KEY_A}&sidoCd=${SIDO}&sgguCd=${district.sgguCd}&clCd=${clCd}&pageNo=${page}&numOfRows=100&_type=json${extra}`
      );
      for (const row of rows) {
        if (!row.ykiho) continue;
        map.set(row.ykiho, {
          ...row,
          regionId: district.id,
          regionLabel: district.label,
        });
      }
      console.log(`listed ${district.label} clCd=${clCd} +${rows.length}`);
      await sleep(150);
    }
  }
  return [...map.values()];
}

async function withLimit(items, limit, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

async function detailsFor(hosp, index, total) {
  const ykiho = encodeURIComponent(hosp.ykiho);
  let mriCount = null;
  let hasMri = false;
  let hasOrtho = "unknown";
  let orthoSpecialistCount = null;
  let hasMriNonpay = "unknown";
  let mriNonpayItems = [];

  try {
    const eq = await getJson(
      `${DTL}/getMedOftInfo2.8?serviceKey=${KEY_A}&ykiho=${ykiho}&pageNo=1&numOfRows=100&_type=json`
    );
    const items = asList(eq?.response?.body?.items);
    const mri = items.find((x) => String(x.oftCd) === MRI);
    if (mri) {
      hasMri = true;
      mriCount = Number(mri.oftCnt || 1);
    } else {
      hasMri = false;
      mriCount = 0;
    }
  } catch {
    hasMri = false;
  }

  if (!hasMri) {
    if ((index + 1) % 20 === 0) console.log(`details ${index + 1}/${total} (no MRI skip)`);
    return { mriCount, hasMri, hasOrtho, orthoSpecialistCount, hasMriNonpay, mriNonpayItems };
  }

  try {
    const dept = await getJson(
      `${DTL}/getDgsbjtInfo2.8?serviceKey=${KEY_A}&ykiho=${ykiho}&pageNo=1&numOfRows=100&_type=json`
    );
    const items = asList(dept?.response?.body?.items);
    const ortho = items.find((x) => String(x.dgsbjtCd).padStart(2, "0") === ORTHO);
    if (ortho) {
      hasOrtho = true;
      const n = Number(ortho.dgsbjtPrSdrCnt);
      orthoSpecialistCount = Number.isFinite(n) ? n : null;
    } else {
      hasOrtho = false;
    }
  } catch {
    hasOrtho = "unknown";
  }

  try {
    const np = await paged(
      (page) =>
        `${NONPAY}?serviceKey=${KEY_B}&ykiho=${ykiho}&pageNo=${page}&numOfRows=100&_type=json`
    );
    mriNonpayItems = [];
    const seen = new Set();
    for (const row of np) {
      const name = String(row.npayKorNm || row.yadmNpayCdNm || "").trim();
      if (!name || !isMriName(name) || seen.has(name)) continue;
      seen.add(name);
      const amt = Number(row.curAmt);
      mriNonpayItems.push({
        name,
        price: Number.isFinite(amt) && amt > 0 ? `${Math.round(amt).toLocaleString("ko-KR")}원` : undefined,
      });
    }
    hasMriNonpay = mriNonpayItems.length > 0;
  } catch {
    hasMriNonpay = "unknown";
  }

  if ((index + 1) % 10 === 0) {
    console.log(`details ${index + 1}/${total}`);
  }
  return { mriCount, hasMri, hasOrtho, orthoSpecialistCount, hasMriNonpay, mriNonpayItems };
}

function normalizeTel(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9]/g, "");
  if (digits.length < 9 || digits.length > 11) return null;
  return String(raw).trim();
}

async function main() {
  console.log("fetching hospital list…");
  const listed = await fetchHospitals();
  console.log(`unique hospitals: ${listed.length}`);
  const details = await withLimit(listed, 10, (h, i) => detailsFor(h, i, listed.length));

  const sourceDate = new Date().toISOString().slice(0, 10);
  const hospitals = [];
  listed.forEach((h, i) => {
    const d = details[i];
    if (!d?.hasMri) return;
    const judged = judge({ hasOrtho: d.hasOrtho, hasMriNonpay: d.hasMriNonpay });
    hospitals.push({
      ykiho: h.ykiho,
      name: h.yadmNm,
      clCd: String(h.clCd),
      clCdNm: h.clCdNm,
      careLevel: careLevel(h.clCd),
      addr: h.addr || "",
      telno: normalizeTel(h.telno),
      lat: h.YPos != null ? Number(h.YPos) : null,
      lng: h.XPos != null ? Number(h.XPos) : null,
      sgguCd: String(h.sgguCd),
      regionId: h.regionId,
      regionLabel: h.regionLabel,
      mriCount: d.mriCount,
      hasMri: true,
      hasOrtho: d.hasOrtho,
      orthoSpecialistCount: d.orthoSpecialistCount,
      hasMriNonpay: d.hasMriNonpay,
      mriNonpayItems: d.mriNonpayItems || [],
      ...judged,
      sourceDate,
    });
  });

  const snapshot = {
    generatedAt: new Date().toISOString(),
    sourceDate,
    source: "국가 공개 정보(건강보험심사평가원) 기반",
    hospitals,
  };

  const dir = path.dirname(fileURLToPath(import.meta.url));
  const out = path.join(dir, "../data/hospitals.json");
  await writeFile(out, JSON.stringify(snapshot, null, 2));
  console.log(`saved ${hospitals.length} MRI hospitals → ${out}`);

  try {
    const { spawn } = await import("node:child_process");
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [path.join(dir, "seed-hospitals.mjs")], {
        cwd: path.join(dir, ".."),
        stdio: "inherit",
      });
      child.on("exit", (code) => (code === 0 ? resolve(null) : reject(new Error(`seed exit ${code}`))));
    });
  } catch (err) {
    console.warn("supabase seed skipped:", err instanceof Error ? err.message : err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
