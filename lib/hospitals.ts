import snapshot from "@/data/hospitals.json";
import { REGIONS } from "./constants";
import { haversineMeters } from "./distance";
import type { Hospital, RegionId, SortMode, Snapshot } from "./types";

const data = snapshot as Snapshot;

export function getSnapshot(): Snapshot {
  return data;
}

export function hospitalsByRegion(regionId: RegionId): Hospital[] {
  if (regionId === "all") return data.hospitals;
  return data.hospitals.filter((h) => h.regionId === regionId);
}

export function hospitalById(ykiho: string): Hospital | undefined {
  return data.hospitals.find((h) => h.ykiho === ykiho);
}

export function sortHospitals(
  list: Hospital[],
  mode: SortMode,
  origin: { lat: number; lng: number } | null
): Hospital[] {
  const copy = [...list];
  if (mode === "distance" && origin) {
    copy.sort((a, b) => {
      const da =
        a.lat != null && a.lng != null
          ? haversineMeters(origin.lat, origin.lng, a.lat, a.lng)
          : Number.POSITIVE_INFINITY;
      const db =
        b.lat != null && b.lng != null
          ? haversineMeters(origin.lat, origin.lng, b.lat, b.lng)
          : Number.POSITIVE_INFINITY;
      return da - db;
    });
    return copy;
  }
  copy.sort((a, b) => {
    const level = (a.careLevel || 9) - (b.careLevel || 9);
    if (level !== 0) return level;
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
