import { applyConfirmation } from "./status";
import type { Hospital } from "./types";

export const JUDGMENT_CONFIRMED_AT = "2026-09-15T00:00:00.000Z";
export const JUDGMENT_PATCHES: Record<string, Partial<Hospital>> = {
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQ4MiQyNjE0ODEjODEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQwMyQ0NjE0ODEjODEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available", telno: "0507-1489-2877" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQyIyQxIyQwMCQzNjEyMjIjNjEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ5OSQyNjE4MzIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ5OSQ0NjE0ODEjODEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkMzgxMTkxIzIxIyQxIyQ5IyQ5OSQzNjE0ODEjNDEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ3OSQyNjEwMDIjNjEjJDEjJDgjJDgz": { confirmedAt: null, reservationStatus: null, telno: "1599-7123" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQwMyQzNjEwMDIjNjEjJDEjJDAjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available", telno: "0507-1368-0001" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzExIyQxIyQzIyQ5MiQyNjE0ODEjNTEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkNDgxOTYxIzIxIyQxIyQxIyQ4MiQyNjEyMjIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ3MiQyNjE0ODEjODEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available", telno: "050-71411-8349" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQxMyQ0NjEwMDIjNjEjJDEjJDAjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQyIyQzIyQwMCQyNjEyMjIjNjEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQxMyQ0NjE0ODEjNjEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ2MiQyNjE4MzIjNDEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ3OSQzNjE0ODEjNDEjJDEjJDgjJDgz": { confirmedAt: null, reservationStatus: null, telno: "1899-0001" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQ2MiQzNjEyMjIjNTEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ5OSQyNjEwMDIjNjEjJDEjJDAjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQ3MiQzNjEwMDIjNTEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQ4OSQyNjEyMjIjODEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ3OSQyNjEyMjIjODEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available", telno: "0507-1481-1223" },
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkNDgxOTYxIzMxIyQxIyQ3IyQ3MiQ0NjEwMDIjNTEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkMzgxNzAyIzMxIyQxIyQzIyQ5OSQzNjE4MzIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQwMyQ0NjEwMDIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ3OSQzNjEwMDIjNTEjJDEjJDIjJDgz": { confirmedAt: null, reservationStatus: null, telno: "042-710-1962" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzExIyQxIyQ3IyQ5OSQyNjE0ODEjNTEjJDEjJDYjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzExIyQxIyQ3IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz": { confirmedAt: null, reservationStatus: null },
  "JDQ4MTYyMiM2MSMkMiMkMiMkMDAkMzgxOTYxIzIxIyQxIyQ5IyQxMyQ0NjEwMDIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ3MiQzNjEyMjIjNzEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQxIyQ3OSQzNjE0ODEjODEjJDEjJDIjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzExIyQxIyQ3IyQxMyQyNjEyMjIjNDEjJDEjJDgjJDgz": { confirmedAt: null, reservationStatus: null },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ5OSQzNjE0ODEjNjEjJDEjJDQjJDgz": { confirmedAt: null, reservationStatus: null },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ2MiQzNjEwMDIjNDEjJDEjJDgjJDgz": { confirmedAt: JUDGMENT_CONFIRMED_AT, reservationStatus: "available" },
  "JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ2MiQyNjEwMDIjODEjJDEjJDYjJDgz": { confirmedAt: null, reservationStatus: null },
  "JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ2MiQzNjE0ODEjNDEjJDEjJDQjJDgz": { confirmedAt: null, reservationStatus: null },
};

export function applyJudgmentHospital(hospital: Hospital): Hospital {
  const patch = JUDGMENT_PATCHES[hospital.ykiho];
  if (!patch) return hospital;
  return applyConfirmation({ ...hospital, ...patch });
}
