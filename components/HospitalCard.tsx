"use client";

import { CARE_LEVEL_LABEL } from "@/lib/constants";
import type { Hospital } from "@/lib/types";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

export function HospitalCard({
  hospital,
  distanceLabel,
  href,
  showDistrict,
}: {
  hospital: Hospital;
  distanceLabel: string | null;
  href: string;
  showDistrict?: boolean;
}) {
  const ortho =
    hospital.hasOrtho === true ? (
      <span className="meta-strong">정형외과 진료</span>
    ) : (
      <span className="missing">정형외과 정보 확인 필요</span>
    );
  const nonpay =
    hospital.hasMriNonpay === true ? (
      <span className="meta-strong">MRI 비급여 항목 공개</span>
    ) : (
      <span className="missing">MRI 비급여 항목 정보 확인 필요</span>
    );
  const mri =
    hospital.mriCount != null ? (
      <span>MRI 장비 보유 {hospital.mriCount}대</span>
    ) : (
      <span className="missing">정보 확인 필요</span>
    );

  return (
    <Link className="card" href={href}>
      <div className="card-head">
        <div className="card-title">
          {showDistrict ? <span className="sggu">{hospital.regionLabel}</span> : null}
          {hospital.name}
        </div>
        <StatusBadge status={hospital.status} />
      </div>
      <div className="meta">
        <div className="meta-row">
          {distanceLabel ? (
            <>
              <span className="dist">{distanceLabel}</span>
              {" · "}
            </>
          ) : null}
          {hospital.clCdNm} · {CARE_LEVEL_LABEL[hospital.careLevel]} · {ortho}
        </div>
        <div className="meta-row">
          {mri} · {nonpay}
        </div>
      </div>
    </Link>
  );
}
