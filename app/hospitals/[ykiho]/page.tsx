"use client";

import { CallModal } from "@/components/CallModal";
import { ErrorState } from "@/components/ErrorState";
import { NavIcon, PhoneIcon } from "@/components/Icons";
import { LoadingState } from "@/components/LoadingState";
import { NonpaySheet } from "@/components/NonpaySheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast } from "@/components/Toast";
import { TypeGuideModal } from "@/components/TypeGuideModal";
import { track } from "@/lib/analytics";
import { CARE_LEVEL_LABEL, MAPS_MISSING_TOAST, displayPartLabel, isPartId } from "@/lib/constants";
import { hospitalById } from "@/lib/hospitals";
import { hospitalSearchUrl, mapEmbedUrl, mapsUrl } from "@/lib/maps";
import { nonpayItemsForPart, nonpayTitle } from "@/lib/nonpay";
import { canDial, displayPhone, hasPhoneNumber } from "@/lib/phone";
import { analyticsStatus } from "@/lib/status";
import { useHospitals } from "@/hooks/useHospitals";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Missing({ text }: { text: string }) {
  return <span className="missing">{text}</span>;
}

function Source({ label }: { label: string }) {
  return <span className="source-tag">{label}</span>;
}

function DetailInner() {
  const router = useRouter();
  const params = useParams<{ ykiho: string }>();
  const search = useSearchParams();
  const ykiho = decodeURIComponent(params.ykiho);
  const loaded = useHospitals();
  const hospital = hospitalById(loaded.hospitals, ykiho);
  const [callOpen, setCallOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const [nonpayOpen, setNonpayOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (loaded.status !== "ready") return;
    if (!hospital) {
      track("detail_not_found", { ykiho }, "S3");
      return;
    }
    track(
      "hospital_detail_view",
      {
        ykiho,
        status: analyticsStatus(hospital.status),
        has_phone: Boolean(hospital.telno),
        entry: search.get("part") ? "list" : "direct",
      },
      "S3"
    );
  }, [loaded.status, hospital, ykiho, search]);

  const qs = search.toString();
  const listHref = qs ? `/hospitals?${qs}` : "/";
  const homeHref = "/";

  function goBack() {
    if (search.get("part") && typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(listHref);
  }

  if (loaded.status === "loading") return <LoadingState onBack={() => router.push(homeHref)} />;
  if (loaded.status === "error") {
    return (
      <div className="page">
        <div className="page-body">
          <ErrorState onRetry={() => void loaded.reload()} onOtherRegion={() => router.push("/")} />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="page">
        <div className="page-body">
          <div className="empty">
            <h2>병원 정보를 찾을 수 없어요</h2>
            <p className="sub">주소가 잘못됐거나 정보가 갱신되었을 수 있어요.</p>
          </div>
        </div>
        <div className="sticky-cta">
          <button type="button" className="primary-btn" onClick={() => router.push("/")}>
            지역 고르러 가기
          </button>
        </div>
      </div>
    );
  }

  const phone = displayPhone(hospital.telno);
  const showCall = hasPhoneNumber(hospital.telno);
  const canNavigate = Boolean(hospital.addr || (hospital.lat && hospital.lng));
  const hasMap = hospital.lat != null && hospital.lng != null;
  const rawPart = search.get("part");
  const partLabel = displayPartLabel(isPartId(rawPart) ? rawPart : null, search.get("other"));
  const typeText = hospital.clCdNm
    ? `${hospital.clCdNm}${hospital.careLevel ? ` · ${CARE_LEVEL_LABEL[hospital.careLevel]}` : ""}`
    : null;
  const mapTarget = {
    name: hospital.name,
    addr: hospital.addr,
    lat: hospital.lat,
    lng: hospital.lng,
  };

  function openMaps() {
    if (!canNavigate) {
      setToast(MAPS_MISSING_TOAST);
      window.setTimeout(() => setToast(null), 2000);
      return;
    }
    track("direction_click", { ykiho, has_coord: Boolean(mapTarget.lat && mapTarget.lng) }, "S3");
    window.open(mapsUrl(mapTarget), "_blank", "noreferrer");
  }

  return (
    <div className="page">
      <div className="page-body">
        <div className="topbar">
          <button type="button" className="icon-btn" onClick={goBack} aria-label="뒤로">
            ←
          </button>
          <div className="topbar-title">병원 상세</div>
        </div>
        <div className="detail-head">
          <h1 className="detail-name">{hospital.name}</h1>
          <StatusBadge status={hospital.status} />
        </div>
        <p className="evidence">{hospital.evidence}</p>

        <dl className="rows">
          <div className="row">
            <dt>MRI 장비</dt>
            <dd>
              {hospital.mriCount != null ? <>보유 {hospital.mriCount}대</> : <Missing text="정보 확인 필요" />}
              <Source label="의료장비" />
            </dd>
          </div>
          <div className="row">
            <dt>정형외과</dt>
            <dd>
              {hospital.hasOrtho === true ? "진료" : <Missing text="정보 확인 필요" />}
              <Source label="진료과목" />
            </dd>
          </div>
          <div className="row">
            <dt>MRI 비급여</dt>
            <dd>
              {hospital.hasMriNonpay === true ? (
                <button
                  type="button"
                  className="nonpay-open"
                  onClick={() => {
                    setNonpayOpen(true);
                    track("nonpay_view", { ykiho, part: rawPart ?? "" }, "S3");
                  }}
                >
                  항목 공개 <span aria-hidden>›</span>
                </button>
              ) : (
                <Missing text="정보 확인 필요" />
              )}
              <Source label="비급여" />
            </dd>
          </div>
        </dl>

        <dl className="rows">
          <div
            className="row tap"
            onClick={() => {
              setGuide(true);
              track("hospital_type_view", { from: "detail" }, "S3");
            }}
          >
            <dt>병원 종류</dt>
            <dd>
              {typeText || <Missing text="정보 없음" />}
              <Source label="병원정보" />
              <span className="row-chevron" aria-hidden>
                ›
              </span>
            </dd>
          </div>
          <div className="row">
            <dt>전화번호</dt>
            <dd>{phone ? <span className="num">{phone}</span> : <Missing text="정보 없음" />}</dd>
          </div>
          <div className="row">
            <dt>주소</dt>
            <dd>{hospital.addr || <Missing text="정보 없음" />}</dd>
          </div>
        </dl>
        {hasMap ? (
          <div className="map-card">
            <iframe
              className="map-embed"
              title={`${hospital.name} 위치`}
              src={mapEmbedUrl(hospital.lat as number, hospital.lng as number)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
        <p className="limit-note">장비가 있어도 예약 상황에 따라 검사가 어려울 수 있어요. 전화로 확인해 주세요.</p>
      </div>

      <div className={`sticky-cta ${showCall ? "cta-pair" : "cta-pair single"}`}>
        {showCall && phone ? (
          <button
            type="button"
            className="primary-btn btn-with-icon"
            onClick={() => {
              setCallOpen(true);
              track("call_confirm", { ykiho, status: analyticsStatus(hospital.status) }, "S4");
            }}
          >
            <PhoneIcon />
            전화하기
          </button>
        ) : (
          <div className="phone-missing">
            등록된 전화번호가 없어요.
            <br />
            공개 데이터에 번호가 없어 바로 걸 수 없어요.
            <a
              className="search-link"
              href={hospitalSearchUrl(hospital.name)}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("hospital_search", { ykiho }, "S3")}
            >
              네이버에서 병원 찾기
            </a>
          </div>
        )}
        <button type="button" className="ghost-btn btn-with-icon" onClick={openMaps}>
          <NavIcon />
          길찾기
        </button>
      </div>

      {callOpen && phone ? (
        <CallModal
          name={hospital.name}
          phone={phone}
          partLabel={partLabel === "MRI" ? undefined : partLabel}
          onClose={() => {
            setCallOpen(false);
            track("call_cancel", { ykiho }, "S4");
          }}
          onCall={() => track("call_click", { ykiho, status: analyticsStatus(hospital.status) }, "S4")}
          onCopy={async () => {
            await navigator.clipboard.writeText(phone);
            track("phone_copy", { ykiho, is_fallback: !canDial(hospital.telno) }, "S4");
          }}
        />
      ) : null}
      {guide ? <TypeGuideModal onClose={() => setGuide(false)} /> : null}
      {nonpayOpen ? (
        <NonpaySheet
          title={nonpayTitle(isPartId(rawPart) ? rawPart : null, search.get("other"))}
          items={nonpayItemsForPart(isPartId(rawPart) ? rawPart : null, search.get("other"))}
          onClose={() => setNonpayOpen(false)}
        />
      ) : null}
      {toast ? <Toast>{toast}</Toast> : null}
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
