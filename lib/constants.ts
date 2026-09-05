import type { OtherPartId, PartId, RegionId } from "./types";

export const APP_NAME = "이어";
export const APP_NAME_EN = "IEO";
export const APP_VERSION = "1.0.0";
export const SOURCE_FOOTER = "국가 공개 정보(건강보험심사평가원) 기반";
export const REGION_SCOPE_NOTE = "지금은 대전광역시에서만 찾을 수 있어요. 다른 지역은 순차적으로 열릴 예정이에요.";

export const SIDO_DAEJEON = "250000";

export const REGIONS: {
  id: RegionId;
  label: string;
  pickLabel: string;
  sgguCd: string | null;
  center: { lat: number; lng: number };
}[] = [
  { id: "donggu", label: "동구", pickLabel: "동구", sgguCd: "250004", center: { lat: 36.312, lng: 127.455 } },
  { id: "junggu", label: "중구", pickLabel: "중구", sgguCd: "250005", center: { lat: 36.325, lng: 127.421 } },
  { id: "seogu", label: "서구", pickLabel: "서구", sgguCd: "250003", center: { lat: 36.355, lng: 127.384 } },
  { id: "yuseong", label: "유성구", pickLabel: "유성구", sgguCd: "250001", center: { lat: 36.362, lng: 127.356 } },
  { id: "daedeok", label: "대덕구", pickLabel: "대덕구", sgguCd: "250002", center: { lat: 36.347, lng: 127.415 } },
  { id: "all", label: "대전 전체", pickLabel: "대전 전체에서 찾기", sgguCd: null, center: { lat: 36.350, lng: 127.385 } },
];

export const PARTS: { id: PartId; label: string }[] = [
  { id: "spine", label: "척추" },
  { id: "shoulder", label: "어깨" },
  { id: "knee", label: "무릎" },
  { id: "hand", label: "손" },
  { id: "foot", label: "발" },
  { id: "other", label: "그 외" },
];

export const OTHER_PARTS: { id: OtherPartId; label: string }[] = [
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
  F1: "MRI 장비 보유 · 정형외과 진료 · MRI 비급여 항목 공개가 확인됐어요.",
  F2: "MRI 장비 보유 · 정형외과 진료가 확인됐어요.",
  F3: "MRI 장비 보유 · MRI 비급여 항목 공개가 확인됐어요.",
  F4: "MRI 장비는 확인됐지만, 정형외과 진료·MRI 비급여 정보가 확인되지 않았어요.",
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
      title: "1차 의료기관 · 의원",
      text: "가까운 곳에서 먼저 진료받는 동네 병원이에요.",
    },
    {
      title: "2차 의료기관 · 병원·종합병원",
      text: "검사나 입원 등 더 다양한 진료를 받을 수 있는 병원이에요.",
    },
    {
      title: "3차 의료기관 · 상급종합병원",
      text: "중증 질환이나 어려운 치료를 전문적으로 진료하는 큰 병원이에요.",
    },
  ],
  note: "MRI 보유 여부는 병원 규모와 비례하지 않아요. 의원급 병원에도 MRI가 있을 수 있고, 큰 병원이라도 MRI가 없을 수 있어요.",
};

export const CALL_GUIDES = ["MRI 검사 받을 수 있나요?", "예약은 언제 가능한가요?"] as const;

export const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 5 * 60 * 1000,
};

export const LIST_TIMEOUT_MS = 5000;
export const LIST_SCROLL_KEY = "ieo-list-scroll";
export const LIST_SORT_KEY = "ieo-list-sort";
export const HOME_SCROLL_KEY = "ieo-home-scroll";
export const GEO_DENIED_TOAST = "브라우저 설정에서 위치 권한을 허용해 주세요";
export const MAPS_MISSING_TOAST = "위치 정보가 없어 길찾기를 열 수 없어요";

export function isPartId(value: string | null): value is PartId {
  return PARTS.some((part) => part.id === value);
}

export function isOtherPartId(value: string | null): value is OtherPartId {
  return OTHER_PARTS.some((part) => part.id === value);
}

export function isRegionId(value: string | null): value is RegionId {
  return REGIONS.some((region) => region.id === value);
}

export function displayPartLabel(part: PartId | null, other?: string | null) {
  if (part === "other") {
    return OTHER_PARTS.find((item) => item.id === other)?.label ?? "그 외";
  }
  return PARTS.find((item) => item.id === part)?.label ?? "MRI";
}

export function homeQuery(part: PartId, region: RegionId, other?: string | null): string {
  const extra = part === "other" && other ? `&other=${other}` : "";
  return `/?part=${part}&region=${region}${extra}`;
}

export function listQuery(part: PartId, region: RegionId, other?: string | null): string {
  const extra = part === "other" && other ? `&other=${other}` : "";
  return `part=${part}&region=${region}${extra}`;
}
