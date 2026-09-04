"use client";

import { CARE_LEVEL_LABEL } from "@/lib/constants";
import type { Hospital } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function Missing({ label }: { label: string }) {
  return <span className="missing">{label}</span>;
}

export function HospitalCard({
  hospital,
  distanceLabel,
  href,
}: {
  hospital: Hospital;
  distanceLabel: string | null;
  href: string;
}) {
  return (
    <a className="card" href={href}>
      <StatusBadge status={hospital.status} />
      <div className="card-title">{hospital.name}</div>
      <div className="meta">
        <span>{hospital.clCdNm}</span>
        <span>{CARE_LEVEL_LABEL[hospital.careLevel]}</span>
        {distanceLabel ? (
          <span className="num">{distanceLabel}</span>
        ) : (
          <Missing label="거리 확인 필요" />
        )}
        {hospital.hasOrtho === true ? (
          <span>{hospital.orthoSpecialistCount ? `정형외과 ${hospital.orthoSpecialistCount}명` : "정형외과 있음"}</span>
        ) : (
          <Missing label={hospital.hasOrtho === false ? "정형외과 정보 없음" : "정형외과 정보 확인 필요"} />
        )}
        {hospital.mriCount != null ? (
          <span className="num">MRI {hospital.mriCount}대</span>
        ) : (
          <Missing label="MRI 정보 확인 필요" />
        )}
        {hospital.hasMriNonpay === true ? (
          <span>MRI 비급여 공개</span>
        ) : (
          <Missing
            label={hospital.hasMriNonpay === false ? "비급여 정보 없음" : "비급여 정보 확인 필요"}
          />
        )}
      </div>
    </a>
  );
}
