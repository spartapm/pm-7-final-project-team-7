import { displayPartLabel } from "./constants";
import type { OtherPartId, PartId } from "./types";

export type NonpayItem = { name: string; note?: string };

const ITEMS: Record<string, NonpayItem[]> = {
  spine: [
    { name: "자기공명영상진단(MRI) 경추" },
    { name: "자기공명영상진단(MRI) 흉추" },
    { name: "자기공명영상진단(MRI) 요추" },
  ],
  shoulder: [
    { name: "자기공명영상진단(MRI) 어깨관절(견관절)" },
    { name: "자기공명영상진단(MRI) 상지" },
  ],
  knee: [
    { name: "자기공명영상진단(MRI) 무릎관절(슬관절)" },
    { name: "자기공명영상진단(MRI) 하지" },
  ],
  hand: [
    { name: "자기공명영상진단(MRI) 손목관절(수관절)" },
    { name: "자기공명영상진단(MRI) 손" },
  ],
  foot: [
    { name: "자기공명영상진단(MRI) 발목관절(족관절)" },
    { name: "자기공명영상진단(MRI) 발" },
  ],
  pelvis: [{ name: "자기공명영상진단(MRI) 골반" }, { name: "자기공명영상진단(MRI) 고관절" }],
  joint: [{ name: "자기공명영상진단(MRI) 관절" }, { name: "자기공명영상진단(MRI) 사지관절" }],
  ligament: [{ name: "자기공명영상진단(MRI) 인대" }, { name: "자기공명영상진단(MRI) 관절 주변 연부조직" }],
  cartilage: [{ name: "자기공명영상진단(MRI) 연골" }, { name: "자기공명영상진단(MRI) 관절연골" }],
  muscle: [{ name: "자기공명영상진단(MRI) 근육" }, { name: "자기공명영상진단(MRI) 연부조직" }],
};

export function nonpayItemsForPart(part: PartId | null, other?: string | null): NonpayItem[] {
  const key = part === "other" && other ? other : part;
  if (key && ITEMS[key]) return ITEMS[key];
  return ITEMS.spine;
}

export function nonpayTitle(part: PartId | null, other?: string | null) {
  const label = displayPartLabel(part, other);
  return `${label} MRI 비급여 항목`;
}

export type { OtherPartId };
