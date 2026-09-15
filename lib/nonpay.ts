import { displayPartLabel } from "./constants";
import type { NonpayItem, PartId } from "./types";

export type { NonpayItem };

const PART_MATCH: Record<PartId, RegExp> = {
  brain: /뇌(?!혈관)|두부|뇌조직|뇌실질/i,
  vessel: /뇌혈관|두개내혈관|MRA/i,
  carotid: /경동맥|경부혈관|경부\s*혈관/i,
  lumbar: /요추|요천추|허리|lumbar/i,
  cervical: /경추|목디스크|cervical/i,
  shoulder: /어깨|견관절/i,
  knee: /무릎|슬관절/i,
  hand: /손목|수관절|(?:^|\/|\s)손(?:\/|\s|$)/i,
  foot: /발목|족관절|(?:^|\/|\s)발(?:\/|\s|$)/i,
  pelvis: /골반|고관절/i,
  joint: /관절/i,
  ligament: /인대/i,
  cartilage: /연골/i,
  muscle: /근육|연부조직/i,
};

export function isMriName(value: string) {
  return /MRI|자기공명|엠아르아이|MRA/i.test(value);
}

export function matchesPart(name: string, part: PartId | null) {
  if (!part) return true;
  return PART_MATCH[part].test(name);
}

export function uniqueNonpayItems(items: NonpayItem[]): NonpayItem[] {
  const seen = new Set<string>();
  const out: NonpayItem[] = [];
  for (const item of items) {
    const name = item.name.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, price: item.price });
  }
  return out;
}

export function itemsForPart(items: NonpayItem[], part: PartId | null) {
  const all = uniqueNonpayItems(items);
  if (!part) return all;
  return all.filter((item) => matchesPart(item.name, part));
}

export function examItemsFromHospital(items: NonpayItem[], part: PartId | null) {
  const matched = uniqueNonpayItems(items).filter((item) => matchesPart(item.name, part));
  return matched.map((item) => ({ name: item.name, available: true }));
}

/** HIRA names like `자기공명영상진단료(MRI-기본검사)/뇌/일반` → title + official subtitle. */
export function displayItemLabel(raw: string): { title: string; subtitle?: string } {
  const parts = raw
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { title: parts.slice(1).join(" · "), subtitle: parts[0] };
  }
  return { title: raw };
}

export function nonpayTitle(part: PartId | null) {
  return `${displayPartLabel(part)} MRI 비급여 항목`;
}
