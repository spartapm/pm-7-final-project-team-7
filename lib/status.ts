import { CONFIRMED_WITHIN_DAYS, EVIDENCE } from "./constants";
import type { Hospital, HospitalStatus, Ternary } from "./types";

export function judgeStatus(input: {
  hasMri: boolean;
  hasOrtho: Ternary;
  hasMriNonpay: Ternary;
}): Pick<Hospital, "status" | "evidenceId" | "evidence"> {
  if (!input.hasMri) {
    return { status: "unknown", evidenceId: "F4", evidence: EVIDENCE.F4 };
  }
  const ortho = input.hasOrtho === true;
  const nonpay = input.hasMriNonpay === true;
  if (ortho && nonpay) return { status: "high", evidenceId: "F1", evidence: EVIDENCE.F1 };
  if (ortho) return { status: "high", evidenceId: "F2", evidence: EVIDENCE.F2 };
  if (nonpay) return { status: "high", evidenceId: "F3", evidence: EVIDENCE.F3 };
  return { status: "unknown", evidenceId: "F4", evidence: EVIDENCE.F4 };
}

export function isRecentConfirmation(confirmedAt: string | null, reservationStatus: string | null) {
  if (!confirmedAt || reservationStatus !== "available") return false;
  const at = new Date(confirmedAt).getTime();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= CONFIRMED_WITHIN_DAYS * 24 * 60 * 60 * 1000;
}

export function applyConfirmation<
  T extends Pick<Hospital, "status" | "evidenceId" | "evidence" | "confirmedAt" | "reservationStatus" | "hasMri" | "hasOrtho" | "hasMriNonpay">,
>(hospital: T): T {
  const judged = judgeStatus(hospital);
  const base = { ...hospital, ...judged };
  if (!isRecentConfirmation(hospital.confirmedAt, hospital.reservationStatus)) return base;
  return {
    ...base,
    status: "confirmed",
    evidenceId: "CONFIRMED",
    evidence: EVIDENCE.CONFIRMED,
  };
}

export function analyticsStatus(status: HospitalStatus) {
  if (status === "confirmed") return "confirmed";
  if (status === "high") return "possible";
  return "unknown";
}

export function careLevelFromClCd(clCd: string | number): 1 | 2 | 3 | 0 {
  const code = String(clCd);
  if (code === "01") return 1;
  if (code === "11" || code === "21" || code === "28" || code === "29" || code === "41" || code === "91") return 2;
  if (code === "31" || code === "51" || code === "92") return 3;
  return 0;
}
