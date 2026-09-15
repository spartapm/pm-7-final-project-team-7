import { applyConfirmation } from "./status";
import { groupOf } from "./constants";
import type { Hospital, PartId, Ternary } from "./types";

/** 중구 QA 경로: 척추(요추·경추)=로딩, 어깨=오류 */
export const DEMO_LOADING_GROUP = "spine" as const;
export const DEMO_ERROR_PART: PartId = "shoulder";
export const DEMO_QA_REGION = "junggu";
export const DEMO_LOADING_MS = 2200;

export const YKIHO_SUN =
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ3OSQ0NjEwMDIjNDEjJDEjJDgjJDgz";
export const YKIHO_SEONGMO =
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ3OSQyNjE4MzIjNTEjJDEjJDIjJDgz";
export const YKIHO_SEGYE =
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkNDgxOTYxIzMxIyQxIyQzIyQxMyQyNjEwMDIjNDEjJDEjJDQjJDgz";

const UNKNOWN: Ternary = "unknown";

const OVERRIDES: Record<string, Partial<Hospital>> = {
  [YKIHO_SUN]: { hasOrtho: UNKNOWN, hasMriNonpay: UNKNOWN },
  [YKIHO_SEONGMO]: { hasOrtho: UNKNOWN, hasMriNonpay: UNKNOWN },
  [YKIHO_SEGYE]: { hasOrtho: UNKNOWN, hasMriNonpay: UNKNOWN },
};

export function isDemoLoading(part: PartId, region: string | null) {
  return groupOf(part) === DEMO_LOADING_GROUP && region === DEMO_QA_REGION;
}

export function isDemoError(part: PartId, region: string | null) {
  return part === DEMO_ERROR_PART && region === DEMO_QA_REGION;
}

export function applyDemoHospital(hospital: Hospital): Hospital {
  const extra = OVERRIDES[hospital.ykiho];
  if (!extra) return hospital;
  return applyConfirmation({ ...hospital, ...extra });
}
