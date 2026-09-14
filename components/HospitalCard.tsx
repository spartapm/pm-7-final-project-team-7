"use client";

import type { Hospital } from "@/lib/types";
import Link from "next/link";

export function HospitalCard({
  hospital,
  distanceLabel,
  href,
}: {
  hospital: Hospital;
  distanceLabel: string | null;
  href: string;
}) {
  const nonpay =
    hospital.hasMriNonpay === true ? "MRI 비급여 항목 공개" : "MRI 비급여 항목 확인 필요";
  const mri = hospital.mriCount != null ? `MRI 장비 보유 ${hospital.mriCount}대` : "MRI 장비 확인 필요";

  return (
    <Link className="card" href={href}>
      <div className="card-head">
        <div>
          <div className="card-title">{hospital.name}</div>
          <div className="card-addr">{hospital.addr}</div>
        </div>
        <div className="card-side">
          {distanceLabel ? <div className="dist">{distanceLabel}</div> : null}
          <span className="sggu">대전 {hospital.regionLabel}</span>
        </div>
      </div>
      <div className="mri-box">
        <strong>{mri}</strong>
        <span aria-hidden>|</span>
        <em className={hospital.hasMriNonpay === true ? "" : "is-muted"}>{nonpay}</em>
      </div>
      <span className="card-cta">상세 보기</span>
    </Link>
  );
}
