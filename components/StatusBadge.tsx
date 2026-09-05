import { STATUS_LABEL } from "@/lib/constants";
import type { HospitalStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: HospitalStatus }) {
  return (
    <span className={`badge ${status}`}>
      <span className="dot" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
