"use client";

import { CallModal } from "@/components/CallModal";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeGuideModal } from "@/components/TypeGuideModal";
import { track } from "@/lib/analytics";
import { CARE_LEVEL_LABEL, SOURCE_FOOTER } from "@/lib/constants";
import { hospitalById } from "@/lib/hospitals";
import { mapsUrl } from "@/lib/maps";
import { canUseTel, normalizePhone } from "@/lib/phone";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Missing({ text }: { text: string }) {
  return <span className="missing">{text}</span>;
}

function DetailInner() {
  const router = useRouter();
  const params = useParams<{ ykiho: string }>();
  const search = useSearchParams();
  const ykiho = decodeURIComponent(params.ykiho);
  const hospital = hospitalById(ykiho);
  const [callOpen, setCallOpen] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if (!hospital) {
      track("detail_not_found", { ykiho }, "S3");
      return;
    }
    track(
      "hospital_detail_view",
      {
        ykiho,
        status: hospital.status === "high" ? "possible" : "unknown",
        has_phone: Boolean(hospital.telno),
        entry: search.get("part") ? "list" : "direct",
      },
      "S3"
    );
  }, [hospital, ykiho, search]);

  if (!hospital) {
    return (
      <div className="page">
        <div className="page-body">
          <h1 className="lede">병원 정보를 찾을 수 없어요</h1>
          <p className="sub">목록에서 다시 선택해 주세요.</p>
        </div>
        <div className="sticky-cta">
          <button type="button" className="primary-btn" onClick={() => router.push("/")}>
            처음으로
          </button>
        </div>
      </div>
    );
  }

  const phone = normalizePhone(hospital.telno);
  const canNavigate = Boolean(hospital.addr || (hospital.lat && hospital.lng));
  const qs = search.toString();

  return (
    <div className="page">
      <div className="page-body">
        <div className="topbar">
          <button type="button" className="icon-btn" onClick={() => router.push(`/hospitals?${qs}`)} aria-label="뒤로">
            ←
          </button>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setGuide(true);
              track("hospital_type_view", { from: "detail" }, "S3");
            }}
          >
            병원 종류
          </button>
        </div>
        <StatusBadge status={hospital.status} />
        <h1 className="detail-name">{hospital.name}</h1>
        <p className="evidence">{hospital.evidence}</p>

        <dl className="rows">
          <div className="row">
            <dt>MRI 장비</dt>
            <dd>
              {hospital.mriCount != null ? (
                <>
                  확인됨 · <span className="num">{hospital.mriCount}대</span>
                </>
              ) : (
                <Missing text="정보 확인 필요" />
              )}
              <div className="source">심평원 의료장비 · {hospital.sourceDate}</div>
            </dd>
          </div>
          <div className="row">
            <dt>정형외과</dt>
            <dd>
              {hospital.hasOrtho === true ? (
                hospital.orthoSpecialistCount ? (
                  <>
                    진료 확인 · 전문의 <span className="num">{hospital.orthoSpecialistCount}명</span>
                  </>
                ) : (
                  "진료 확인"
                )
              ) : hospital.hasOrtho === false ? (
                <Missing text="정보 없음" />
              ) : (
                <Missing text="정보 확인 필요" />
              )}
              <div className="source">심평원 진료과목 · {hospital.sourceDate}</div>
            </dd>
          </div>
          <div className="row">
            <dt>MRI 비급여</dt>
            <dd>
              {hospital.hasMriNonpay === true ? (
                "관련 항목 공개"
              ) : hospital.hasMriNonpay === false ? (
                <Missing text="정보 없음" />
              ) : (
                <Missing text="정보 확인 필요" />
              )}
              <div className="source">심평원 비급여 · {hospital.sourceDate}</div>
            </dd>
          </div>
          <div className="row">
            <dt>종별</dt>
            <dd>
              {hospital.clCdNm} · {CARE_LEVEL_LABEL[hospital.careLevel]}
            </dd>
          </div>
          <div className="row">
            <dt>주소</dt>
            <dd>{hospital.addr || <Missing text="정보 없음" />}</dd>
          </div>
          <div className="row">
            <dt>전화</dt>
            <dd>{phone ? <span className="num">{phone}</span> : <Missing text="정보 없음" />}</dd>
          </div>
        </dl>
        <p className="footer-note">{SOURCE_FOOTER}. MRI 보유만으로 검사가 확정되지는 않습니다.</p>
      </div>

      <div className={`sticky-cta ${phone && canNavigate ? "cta-pair" : "cta-pair single"}`}>
        {phone ? (
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setCallOpen(true);
              track("call_confirm", { ykiho, status: hospital.status }, "S4");
            }}
          >
            전화하기
          </button>
        ) : null}
        {canNavigate ? (
          <a
            className={phone ? "ghost-btn" : "primary-btn"}
            style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
            href={mapsUrl({ name: hospital.name, addr: hospital.addr, lat: hospital.lat, lng: hospital.lng })}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              track("direction_click", { ykiho, has_coord: Boolean(hospital.lat && hospital.lng) }, "S3")
            }
          >
            길찾기
          </a>
        ) : null}
      </div>

      {callOpen && phone ? (
        <CallModal
          name={hospital.name}
          phone={phone}
          onClose={() => {
            setCallOpen(false);
            track("call_cancel", { ykiho }, "S4");
          }}
          onCall={() => track("call_click", { ykiho, status: hospital.status }, "S4")}
          onCopy={async () => {
            await navigator.clipboard.writeText(phone);
            track("phone_copy", { ykiho, is_fallback: !canUseTel() }, "S4");
          }}
        />
      ) : null}
      {guide ? <TypeGuideModal onClose={() => setGuide(false)} /> : null}
    </div>
  );
}

export default function HospitalDetailPage() {
  return (
    <Suspense>
      <DetailInner />
    </Suspense>
  );
}
