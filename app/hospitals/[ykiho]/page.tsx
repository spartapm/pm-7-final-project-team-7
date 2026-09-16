"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { CallModal } from "@/components/CallModal";
import { ErrorState } from "@/components/ErrorState";
import { ExamHeadIcon, ExamItemIcon, InfoIcon, NavIcon, PhoneIcon } from "@/components/Icons";
import { LoadingState } from "@/components/LoadingState";
import { NonpaySheet } from "@/components/NonpaySheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast } from "@/components/Toast";
import { TypeGuideModal } from "@/components/TypeGuideModal";
import { track } from "@/lib/analytics";
import {
  MAPS_MISSING_TOAST,
  PORTAL_NOTICE_BODY,
  PORTAL_NOTICE_LEAD,
  displayPartLabel,
  hospitalKindLabel,
  resolvePart,
} from "@/lib/constants";
import { hospitalById } from "@/lib/hospitals";
import { rememberListHospital } from "@/lib/list-memory";
import { hospitalSearchUrl, mapEmbedUrl, mapsUrl } from "@/lib/maps";
import { displayItemLabel, examItemsFromHospital, itemsForPart, nonpayTitle } from "@/lib/nonpay";
import { canDial, displayPhone, hasPhoneNumber } from "@/lib/phone";
import { analyticsStatus } from "@/lib/status";
import type { NonpayItem } from "@/lib/types";
import { useHospitals } from "@/hooks/useHospitals";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Missing({ text }: { text: string }) {
  return <span className="missing">{text}</span>;
}

function Source({ label }: { label: string }) {
  return <span className="source-tag">{label}</span>;
}

function neighborhoodFromAddr(addr: string) {
  const match = addr.match(/\(([^)]+동)\)/);
  return match?.[1] ?? null;
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
  const [liveItems, setLiveItems] = useState<NonpayItem[] | null>(null);

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
        has_phone: hasPhoneNumber(hospital.telno),
        entry: search.get("part") ? "list" : "direct",
      },
      "S3"
    );
  }, [loaded.status, hospital, ykiho, search]);

  useEffect(() => {
    if (!hospital) return;
    if (hospital.mriNonpayItems?.length) {
      setLiveItems(hospital.mriNonpayItems);
      return;
    }
    let cancelled = false;
    fetch(`/api/hospitals/${encodeURIComponent(ykiho)}/nonpay`)
      .then((res) => res.json())
      .then((data: { items?: NonpayItem[] }) => {
        if (!cancelled && Array.isArray(data.items)) setLiveItems(data.items);
      })
      .catch(() => {
        if (!cancelled) setLiveItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hospital, ykiho]);

  useEffect(() => {
    rememberListHospital(ykiho);
  }, [ykiho]);

  const qs = search.toString();
  const listHref = qs ? `/hospitals?${qs}` : "/";
  const homeHref = "/";

  function goBack() {
    rememberListHospital(ykiho);
    if (search.get("part") || search.get("region")) {
      router.replace(listHref);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
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
  const selectedPart = resolvePart(search.get("part"), search.get("group"), search.get("other"));
  const partLabel = displayPartLabel(selectedPart);
  const kindLabel = hospitalKindLabel(hospital.clCd, hospital.clCdNm);
  const nonpayItems = (hospital.mriNonpayItems?.length ? hospital.mriNonpayItems : liveItems) ?? [];
  const examItems = examItemsFromHospital(nonpayItems, selectedPart);
  const sheetItems = itemsForPart(nonpayItems, selectedPart);
  const disclosed = examItems.length > 0;
  const mapTarget = {
    name: hospital.name,
    addr: hospital.addr,
    lat: hospital.lat,
    lng: hospital.lng,
  };
  const addr = hospital.addr;
  const dong = neighborhoodFromAddr(addr);

  async function copyAddress() {
    if (!addr) return;
    await navigator.clipboard.writeText(addr);
    setToast("주소를 복사했어요");
    window.setTimeout(() => setToast(null), 2000);
  }

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
      <BrandHeader variant="detail" onBack={goBack} />
      <div className="page-body">
        <div className="verify-row">
          <span className="verify-chip navy">{kindLabel}</span>
          <span className="verify-chip gray">심평원 공공데이터 검증</span>
        </div>

        <div className="detail-hero">
          <div className="detail-head">
            <h1 className="detail-name">{hospital.name}</h1>
            <StatusBadge status={hospital.status} />
          </div>
          <p className="evidence">{hospital.evidence}</p>
        </div>

        <dl className="rows">
          <div className="row">
            <dt>
              MRI 장비
              <Source label="의료장비" />
            </dt>
            <dd>
              {hospital.mriCount != null ? <span className="row-value">보유 {hospital.mriCount}대</span> : <Missing text="정보 확인 필요" />}
            </dd>
          </div>
          <div className="row">
            <dt>
              정형외과
              <Source label="진료과목" />
            </dt>
            <dd>{hospital.hasOrtho === true ? "진료" : <Missing text="정보 확인 필요" />}</dd>
          </div>
          <div className="row">
            <dt>
              MRI 비급여
              <Source label="비급여" />
            </dt>
            <dd>
              {disclosed ? (
                <button
                  type="button"
                  className="nonpay-open"
                  onClick={() => {
                    setNonpayOpen(true);
                    track("nonpay_view", { ykiho, part: selectedPart ?? "" }, "S3");
                  }}
                >
                  항목 공개 <span aria-hidden>›</span>
                </button>
              ) : (
                <Missing text="정보 확인 필요" />
              )}
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
            <dt>
              병원 종류
              <Source label="병원정보" />
            </dt>
            <dd>
              {kindLabel}
              <span className="row-chevron" aria-hidden>
                ›
              </span>
            </dd>
          </div>
          <div className="row">
            <dt>전화번호</dt>
            <dd>{phone ? <span className="num row-value">{phone}</span> : <Missing text="정보 없음" />}</dd>
          </div>
          <div className="row">
            <dt>주소</dt>
            <dd>
              {hospital.addr ? (
                <>
                  <span className="addr-text">{hospital.addr}</span>
                  <button type="button" className="copy-btn" onClick={() => void copyAddress()}>
                    복사
                  </button>
                </>
              ) : (
                <Missing text="정보 없음" />
              )}
            </dd>
          </div>
        </dl>

        {hospital.addr || hasMap ? (
          <div className="map-card">
            <div className="map-head">
              <div>
                {dong ? <span className="dong-chip">{dong}</span> : null}
                <p>{hospital.addr}</p>
                <span>{hospital.name}</span>
              </div>
              {hospital.addr ? (
                <button type="button" className="map-copy" onClick={() => void copyAddress()}>
                  주소 복사
                </button>
              ) : null}
            </div>
            {hasMap ? (
              <iframe
                className="map-embed"
                title={`${hospital.name} 위치`}
                src={mapEmbedUrl(hospital.lat as number, hospital.lng as number)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
        ) : null}

        <section className="exam-card">
          <div className="exam-head">
            <h2>
              <ExamHeadIcon />
              검사 가능 정밀 항목 현황
            </h2>
          </div>
          {examItems.length ? (
            examItems.map((item, index) => {
              const label = displayItemLabel(item.name);
              return (
                <div className="exam-row" key={item.name}>
                  <span className="exam-ico">
                    <ExamItemIcon index={index} />
                  </span>
                  <div className="exam-copy">
                    <p className="exam-title">{label.title}</p>
                    {label.subtitle ? <p className="exam-sub">{label.subtitle}</p> : null}
                  </div>
                  <span className={`exam-badge ${item.available ? "ok" : "need"}`}>
                    {item.available ? "검사 가능" : "확인 필요"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="exam-row">
              <span className="exam-ico">
                <ExamItemIcon index={0} />
              </span>
              <div className="exam-copy">
                <p className="exam-title">
                  {liveItems == null && !hospital.mriNonpayItems?.length
                    ? "공개된 MRI 항목을 불러오는 중이에요."
                    : `이 병원에서 공개된 ${partLabel} MRI 항목을 확인하지 못했어요.`}
                </p>
              </div>
              <span className="exam-badge need">{liveItems == null && !hospital.mriNonpayItems?.length ? "불러오는 중" : "확인 필요"}</span>
            </div>
          )}
        </section>

        <p className="portal-note">
          <InfoIcon />
          <span>
            <strong>{PORTAL_NOTICE_LEAD}</strong> {PORTAL_NOTICE_BODY}
          </span>
        </p>
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
          title={nonpayTitle(selectedPart)}
          items={sheetItems}
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
