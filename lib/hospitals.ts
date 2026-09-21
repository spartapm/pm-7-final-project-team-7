import snapshot from "@/data/hospitals.json";
import { applyConfirmation } from "./status";
import { applyDemoHospital } from "./demo";
import { applyJudgmentHospital } from "./judgment";
import { getSupabase } from "./supabase";
import { REGIONS } from "./constants";
import { haversineMeters } from "./distance";
import type { Hospital, RegionId, SortMode, Snapshot, Ternary } from "./types";

type HospitalRow = {
  ykiho: string;
  name: string;
  cl_cd: string;
  cl_cd_nm: string;
  care_level: number;
  addr: string | null;
  telno: string | null;
  lat: number | null;
  lng: number | null;
  sggu_cd: string;
  region_id: RegionId;
  region_label: string;
  mri_count: number | null;
  has_mri: boolean;
  has_ortho: boolean | null;
  ortho_specialist_count: number | null;
  has_mri_nonpay: boolean | null;
  mri_nonpay_items?: { name: string; price?: string }[] | null;
  status: "high" | "unknown";
  evidence_id: "F1" | "F2" | "F3" | "F4";
  evidence: string;
  source_date: string;
  mri_scope: string | null;
  reservation_status: string | null;
  confirmed_at: string | null;
};

const localSnapshot = snapshot as Snapshot;
let memory: { at: number; data: Snapshot } | null = null;
const CACHE_MS = 60_000;

function ternary(value: boolean | null | undefined): Ternary {
  if (value === true) return true;
  if (value === false) return false;
  return "unknown";
}

function mapRow(row: HospitalRow): Hospital {
  const mapped = applyConfirmation({
    ykiho: row.ykiho,
    name: row.name,
    clCd: row.cl_cd,
    clCdNm: row.cl_cd_nm,
    careLevel: (row.care_level === 1 || row.care_level === 2 || row.care_level === 3 ? row.care_level : 0) as 1 | 2 | 3 | 0,
    addr: row.addr || "",
    telno: row.telno,
    lat: row.lat,
    lng: row.lng,
    sgguCd: row.sggu_cd,
    regionId: row.region_id,
    regionLabel: row.region_label,
    mriCount: row.mri_count,
    hasMri: row.has_mri,
    hasOrtho: ternary(row.has_ortho),
    orthoSpecialistCount: row.ortho_specialist_count,
    hasMriNonpay: ternary(row.has_mri_nonpay),
    mriNonpayItems: Array.isArray(row.mri_nonpay_items) ? row.mri_nonpay_items : [],
    status: row.status,
    evidenceId: row.evidence_id,
    evidence: row.evidence,
    sourceDate: String(row.source_date).slice(0, 10),
    mriScope: row.mri_scope,
    reservationStatus: row.reservation_status,
    confirmedAt: row.confirmed_at,
  });
  return applyJudgmentHospital(applyDemoHospital(mapped));
}

function withLocalFields(hospital: Hospital): Hospital {
  return applyJudgmentHospital(
    applyDemoHospital(
      applyConfirmation({
        ...hospital,
        mriScope: hospital.mriScope ?? null,
        mriNonpayItems: hospital.mriNonpayItems ?? [],
        reservationStatus: hospital.reservationStatus ?? null,
        confirmedAt: hospital.confirmedAt ?? null,
      })
    )
  );
}

function localData(): Snapshot {
  return {
    ...localSnapshot,
    hospitals: localSnapshot.hospitals.map(withLocalFields),
  };
}

export async function loadSnapshot(force = false): Promise<Snapshot> {
  if (!force && memory && Date.now() - memory.at < CACHE_MS) return memory.data;

  const sb = getSupabase();
  if (!sb) {
    memory = { at: Date.now(), data: localData() };
    return memory.data;
  }

  const [{ data: snap, error: snapErr }, { data: rows, error }] = await Promise.all([
    sb.from("snapshots").select("generated_at, source_date, source").eq("id", "current").maybeSingle(),
    sb.from("hospitals").select("*").order("name"),
  ]);

  if (error || !rows) {
    throw new Error(error?.message || snapErr?.message || "병원 정보를 불러오지 못했어요");
  }

  const data: Snapshot = {
    generatedAt: snap?.generated_at || new Date().toISOString(),
    sourceDate: snap?.source_date || "",
    source: snap?.source || "국가 공개 정보(건강보험심사평가원) 기반",
    hospitals: (rows as HospitalRow[]).map(mapRow),
  };
  memory = { at: Date.now(), data };
  return data;
}

export function hospitalsByRegion(list: Hospital[], regionId: RegionId): Hospital[] {
  if (regionId === "all") return list;
  return list.filter((h) => h.regionId === regionId);
}

export function hospitalById(list: Hospital[], ykiho: string): Hospital | undefined {
  return list.find((h) => h.ykiho === ykiho);
}

export function sortHospitals(
  list: Hospital[],
  mode: SortMode,
  origin: { lat: number; lng: number } | null
): Hospital[] {
  const copy = [...list];
  const badgeRank = (h: Hospital) => (h.status === "high" || h.status === "confirmed" ? 0 : 1);
  const typeRank = (h: Hospital) => {
    if (h.careLevel === 1) return 0;
    if (h.careLevel === 2) return 1;
    if (h.careLevel === 3) return 2;
    return 3;
  };
  copy.sort((a, b) => {
    if (mode === "distance" && origin) {
      const da =
        a.lat != null && a.lng != null
          ? haversineMeters(origin.lat, origin.lng, a.lat, a.lng)
          : Number.POSITIVE_INFINITY;
      const db =
        b.lat != null && b.lng != null
          ? haversineMeters(origin.lat, origin.lng, b.lat, b.lng)
          : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      const badge = badgeRank(a) - badgeRank(b);
      if (badge !== 0) return badge;
      return a.name.localeCompare(b.name, "ko");
    }
    const type = typeRank(a) - typeRank(b);
    if (type !== 0) return type;
    const badge = badgeRank(a) - badgeRank(b);
    if (badge !== 0) return badge;
    if (origin) {
      const da =
        a.lat != null && a.lng != null
          ? haversineMeters(origin.lat, origin.lng, a.lat, a.lng)
          : Number.POSITIVE_INFINITY;
      const db =
        b.lat != null && b.lng != null
          ? haversineMeters(origin.lat, origin.lng, b.lat, b.lng)
          : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
    }
    return a.name.localeCompare(b.name, "ko");
  });
  return copy;
}

export function regionLabel(id: RegionId): string {
  return REGIONS.find((r) => r.id === id)?.label ?? id;
}

export function regionById(id: RegionId) {
  return REGIONS.find((r) => r.id === id);
}
