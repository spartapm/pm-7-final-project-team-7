import { CONFIRMED_WITHIN_DAYS, EVIDENCE } from "./constants";
import type { Hospital, HospitalStatus, Ternary } from "./types";

export function judgeStatus(input: {
  hasMri: boolean;
  hasOrtho: Ternary;
  hasMriNonpay: Ternary;
}): Pick<Hospital, "status" | "evidenceId" | "evidence"> {
  if (!input.hasMri) {
    return {
      status: "unknown",
      evidenceId: "F4",
      evidence: EVIDENCE.F4,
    };
  }

  const high = input.hasOrtho === true || input.hasMriNonpay === true;
  const status: HospitalStatus = high ? "high" : "unknown";

  if (input.hasOrtho === true) {
    return { status: "high", evidenceId: "F1", evidence: EVIDENCE.F1 };
  }
  if (input.hasMriNonpay === true) {
    return { status: "high", evidenceId: "F2", evidence: EVIDENCE.F2 };
  }
  if (input.hasOrtho === "unknown" || input.hasMriNonpay === "unknown") {
    return { status, evidenceId: "F4", evidence: EVIDENCE.F4 };
  }
  return { status: "unknown", evidenceId: "F3", evidence: EVIDENCE.F3 };
}

export function isRecentConfirmation(confirmedAt: string | null, reservationStatus: string | null) {
  if (!confirmedAt || reservationStatus !== "available") return false;
  const at = new Date(confirmedAt).getTime();
  if (!Number.isFinite(at)) return false;
  return Date.now() - at <= CONFIRMED_WITHIN_DAYS * 24 * 60 * 60 * 1000;
}

export function applyConfirmation<T extends Pick<Hospital, "status" | "evidenceId" | "evidence" | "confirmedAt" | "reservationStatus">>(
  hospital: T
): T {
  if (!isRecentConfirmation(hospital.confirmedAt, hospital.reservationStatus)) return hospital;
  return {
    ...hospital,
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
  if (code === "11" || code === "21") return 2;
  if (code === "31") return 3;
  return 0;
}
