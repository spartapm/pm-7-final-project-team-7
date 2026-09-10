import type { PartId, RegionId } from "./types";

export { analyticsStatus } from "./status";

export const GA_MEASUREMENT_ID = "G-WNMM6ZKTZB";
export const GTM_CONTAINER_ID = "GTM-WCKN9286";

/**
 * 핵심 전환 이벤트.
 * gtag + dataLayer로 보내고, Supabase app_events에도 남깁니다.
 *
 * part_select 값은 S1 하위 부위 id입니다.
 * 뇌/혈관/경동맥, 요추/경추, 어깨~근육.
 * region_select의 all은 홈에는 없고, 결과 없음 → 대전 전체에서 찾을 때만 검색 region으로 남습니다.
 */
export const EVENTS = {
  service_view: "service_view",
  part_select: "part_select",
  region_select: "region_select",
  search_submit: "search_submit",
  no_result: "no_result",
  location_permission: "location_permission",
  hospital_select: "hospital_select",
  hospital_detail_view: "hospital_detail_view",
  direction_click: "direction_click",
  call_confirm: "call_confirm",
  call_click: "call_click",
  phone_copy: "phone_copy",
} as const;

export type AnalyticsStatus = "possible" | "unknown";
export type LocationPermissionResult = "granted" | "denied" | "timeout" | "unsupported";

export type CoreEventPayload = {
  service_view: { entry: "first" | "back" };
  part_select: { part: PartId };
  region_select: { region: Exclude<RegionId, "all"> };
  search_submit: { region: RegionId; part: PartId };
  no_result: { region: RegionId | ""; part: PartId };
  location_permission: { result: LocationPermissionResult };
  hospital_select: {
    ykiho: string;
    status: AnalyticsStatus;
    position: number;
    distance_m?: number;
  };
  hospital_detail_view: {
    ykiho: string;
    status: AnalyticsStatus;
    has_phone: boolean;
    entry: "list" | "direct";
  };
  direction_click: { ykiho: string; has_coord: boolean };
  call_confirm: { ykiho: string; status: AnalyticsStatus };
  call_click: { ykiho: string; status: AnalyticsStatus };
  phone_copy: { ykiho: string; is_fallback: boolean };
};
