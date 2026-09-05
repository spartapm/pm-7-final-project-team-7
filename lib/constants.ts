import type { OtherPartId, PartId, RegionId } from "./types";

export const APP_NAME = "이어";
export const APP_NAME_EN = "IEO";
export const APP_VERSION = "1.0.0";
export const SOURCE_FOOTER = "국가 공개 정보(건강보험심사평가원) 기반";

export const SIDO_DAEJEON = "250000";

export const REGIONS: {
  id: RegionId;
  label: string;
  sgguCd: string | null;
  center: { lat: number; lng: number };
}[] = [
  { id: "donggu", label: "동구", sgguCd: "250004", center: { lat: 36.312, lng: 127.455 } },
  { id: "junggu", label: "중구", sgguCd: "250005", center: { lat: 36.325, lng: 127.421 } },
  { id: "seogu", label: "서구", sgguCd: "250003", center: { lat: 36.355, lng: 127.384 } },
  { id: "yuseong", label: "유성구", sgguCd: "250001", center: { lat: 36.362, lng: 127.356 } },
  { id: "daedeok", label: "대덕구", sgguCd: "250002", center: { lat: 36.347, lng: 127.415 } },
  { id: "all", label: "대전 전체", sgguCd: null, center: { lat: 36.350, lng: 127.385 } },
];

export const PARTS: { id: PartId; label: string; question: string }[] = [
  { id: "spine", label: "척추", question: "허리·등 쪽 MRI가 필요하신가요?" },
  { id: "shoulder", label: "어깨", question: "어깨 MRI가 필요하신가요?" },
  { id: "knee", label: "무릎", question: "무릎 MRI가 필요하신가요?" },
  { id: "hand", label: "손", question: "손 MRI가 필요하신가요?" },
  { id: "foot", label: "발", question: "발 MRI가 필요하신가요?" },
  { id: "other", label: "그 외", question: "다른 부위 MRI가 필요하신가요?" },
];

export const OTHER_PARTS: { id: OtherPartId; label: string }[] = [
  { id: "bone", label: "뼈" },
  { id: "wrist", label: "손목" },
  { id: "liver", label: "간" },
  { id: "pelvis", label: "골반" },
  { id: "joint", label: "관절" },
  { id: "ligament", label: "인대" },
  { id: "cartilage", label: "연골" },
  { id: "muscle", label: "근육" },
];

export const MRI_EQ_CODE = "B301";
export const ORTHO_DEPT_CODE = "05";

export const EVIDENCE = {
  CONFIRMED: "최근 확인 결과, 이 병원에서 MRI 검사를 받을 수 있습니다.",
  F1: "MRI 장비와 정형외과 진료가 확인되어 검사 가능성이 높습니다.",
  F2: "MRI 장비와 MRI 관련 비급여 항목 공개가 확인되어 검사 가능성이 높습니다.",
  F3: "MRI 장비는 확인됐지만 정형외과·비급여 정보가 부족해 전화로 확인이 필요합니다.",
  F4: "MRI 장비는 확인됐지만 실제 검사 가능 여부는 의료기관에 확인이 필요합니다.",
} as const;

export const STATUS_LABEL = {
  confirmed: "최근 검사 가능 확인",
  high: "검사 가능성 높음",
  unknown: "확인 필요",
} as const;

export const CONFIRMED_WITHIN_DAYS = 30;

export const CARE_LEVEL_LABEL: Record<number, string> = {
  1: "3차",
  2: "2차",
  3: "1차",
  0: "기타",
};

export const TYPE_GUIDE = {
  title: "병원 종류가 뭐예요?",
  body: [
    {
      title: "1차 의료기관",
      text: "의원급입니다. 동네에서 먼저 진료를 받는 곳이에요.",
    },
    {
      title: "2차 의료기관",
      text: "병원·종합병원입니다. 입원과 특수 검사가 가능한 곳이 많습니다.",
    },
    {
      title: "3차 의료기관",
      text: "상급종합병원입니다. 중증·고난도 진료를 맡는 곳이에요.",
    },
  ],
  note: "MRI 보유 여부는 병원 규모와 같지 않습니다. 의원에도 MRI가 있을 수 있고, 큰 병원이어도 해당 검사가 어려울 수 있습니다.",
};

export const CALL_GUIDE = "MRI 검사 받을 수 있나요?";

export const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 5 * 60 * 1000,
};

export const LIST_TIMEOUT_MS = 5000;
export const LIST_SCROLL_KEY = "ieo-list-scroll";

export function isPartId(value: string | null): value is PartId {
  return PARTS.some((part) => part.id === value);
}

export function isOtherPartId(value: string | null): value is OtherPartId {
  return OTHER_PARTS.some((part) => part.id === value);
}

export function isRegionId(value: string | null): value is RegionId {
  return REGIONS.some((region) => region.id === value);
}

export function homeQuery(part: PartId, region: RegionId, other?: string | null): string {
  const extra = part === "other" && other ? `&other=${other}` : "";
  return `/?part=${part}&region=${region}${extra}`;
}

export function listQuery(part: PartId, region: RegionId, other?: string | null): string {
  const extra = part === "other" && other ? `&other=${other}` : "";
  return `part=${part}&region=${region}${extra}`;
}
