import { STATUS_LABEL } from "@/lib/constants";
import type { HospitalStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: HospitalStatus }) {
  return (
    <span className={`badge ${status}`}>
      <span className="dot" aria-hidden />
      {status === "high" ? "검사 가능성 높음" : STATUS_LABEL[status]}
    </span>
  );
}
