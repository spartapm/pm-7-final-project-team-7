import { displayPartLabel } from "./constants";
import type { PartId } from "./types";

export type NonpayItem = { name: string; price?: string; note?: string };

const ITEMS: Record<PartId, NonpayItem[]> = {
  brain: [{ name: "자기공명영상진단(MRI) 뇌" }, { name: "자기공명영상진단(MRI) 뇌조직" }],
  vessel: [{ name: "자기공명영상진단(MRA) 뇌혈관" }, { name: "자기공명영상진단(MRI) 뇌혈관" }],
  carotid: [{ name: "자기공명영상진단(MRA) 경동맥" }, { name: "자기공명영상진단(MRI) 경부혈관" }],
  lumbar: [{ name: "자기공명영상진단(MRI) 요추" }],
  cervical: [{ name: "자기공명영상진단(MRI) 경추" }],
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

export function nonpayItemsForPart(part: PartId | null): NonpayItem[] {
  if (part && ITEMS[part]) return ITEMS[part];
  return ITEMS.lumbar;
}

export function nonpayTitle(part: PartId | null) {
  return `${displayPartLabel(part)} MRI 비급여 항목`;
}

export function examItemsForPart(part: PartId | null, disclosed: boolean) {
  return nonpayItemsForPart(part).map((item) => ({
    name: item.name,
    available: disclosed,
  }));
}
