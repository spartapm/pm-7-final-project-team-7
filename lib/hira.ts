import { HIRA_KEY_A, HIRA_KEY_B } from "./hira-keys.js";
import { hoursFromHira, type HospitalHours } from "./hours";
import { isMriName, uniqueNonpayItems } from "./nonpay";
import type { NonpayItem } from "./types";

const NONPAY =
  "https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/getNonPaymentItemHospDtlList";
const DTL = "https://apis.data.go.kr/B551182/MadmDtlInfoService2.8/getDtlInfo2.8";

function asList(items: unknown): Record<string, unknown>[] {
  if (!items || typeof items !== "object") return [];
  const raw = (items as { item?: unknown }).item ?? items;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw as Record<string, unknown>];
}

function hiraKey() {
  return process.env.HIRA_KEY_B || process.env.HIRA_KEY_A || HIRA_KEY_B || HIRA_KEY_A;
}

function hiraDetailKey() {
  return process.env.HIRA_KEY_A || HIRA_KEY_A;
}

function formatAmount(value: unknown) {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function parseNonpayRow(row: Record<string, unknown>): NonpayItem | null {
  const name = String(row.npayKorNm || row.yadmNpayCdNm || "").trim();
  if (!name || !isMriName(name)) return null;
  return { name, price: formatAmount(row.curAmt) };
}

export async function fetchMriNonpayItems(ykiho: string): Promise<NonpayItem[]> {
  const key = hiraKey();
  if (!key || !ykiho) return [];
  const encoded = encodeURIComponent(ykiho);
  const items: NonpayItem[] = [];
  let page = 1;
  let pages = 1;
  while (page <= pages) {
    const url = `${NONPAY}?serviceKey=${key}&ykiho=${encoded}&pageNo=${page}&numOfRows=100&_type=json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;
    const json = (await res.json()) as {
      response?: { body?: { totalCount?: number; numOfRows?: number; items?: unknown } };
    };
    const body = json.response?.body;
    const total = Number(body?.totalCount || 0);
    const rows = Number(body?.numOfRows || 100) || 100;
    pages = Math.max(1, Math.ceil(total / rows));
    for (const row of asList(body?.items)) {
      const item = parseNonpayRow(row);
      if (item) items.push(item);
    }
    page += 1;
  }
  return uniqueNonpayItems(items);
}

export async function fetchHospitalHours(ykiho: string): Promise<HospitalHours> {
  const key = hiraDetailKey();
  if (!key || !ykiho) return { days: [], hasAny: false };
  const url = `${DTL}?serviceKey=${key}&ykiho=${encodeURIComponent(ykiho)}&_type=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { days: [], hasAny: false };
  const json = (await res.json()) as { response?: { body?: { items?: unknown } } };
  const rows = asList(json.response?.body?.items);
  return hoursFromHira(rows[0]);
}
