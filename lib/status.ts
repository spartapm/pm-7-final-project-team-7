import { EVIDENCE } from "./constants";
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

export function careLevelFromClCd(clCd: string | number): 1 | 2 | 3 | 0 {
  const code = String(clCd);
  if (code === "01") return 1;
  if (code === "11" || code === "21") return 2;
  if (code === "31") return 3;
  return 0;
}
