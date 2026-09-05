"use client";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { HospitalCard } from "@/components/HospitalCard";
import { LoadingState } from "@/components/LoadingState";
import { LocationBanner } from "@/components/LocationBanner";
import { SortChips } from "@/components/SortChips";
import { Toast } from "@/components/Toast";
import { TypeGuideModal } from "@/components/TypeGuideModal";
import { track } from "@/lib/analytics";
import {
  GEO_DENIED_TOAST,
  LIST_SCROLL_KEY,
  LIST_SORT_KEY,
  displayPartLabel,
  homeQuery,
  isPartId,
  isRegionId,
  listQuery,
} from "@/lib/constants";
import { formatDistance, haversineMeters } from "@/lib/distance";
import { hospitalsByRegion, regionLabel, sortHospitals } from "@/lib/hospitals";
import { analyticsStatus } from "@/lib/status";
import type { SortMode } from "@/lib/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useHospitals } from "@/hooks/useHospitals";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function readSavedSort(): SortMode | null {
  try {
    const value = sessionStorage.getItem(LIST_SORT_KEY);
    if (value === "distance" || value === "type") return value;
  } catch {
    /* ignore */
  }
  return null;
}

function saveListScroll() {
  const shell = document.querySelector(".app-shell");
  const top = shell ? shell.scrollTop : window.scrollY;
  sessionStorage.setItem(LIST_SCROLL_KEY, String(top));
}

function ListInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawPart = params.get("part");
  const rawRegion = params.get("region");
  const part = isPartId(rawPart) ? rawPart : "spine";
  const region = isRegionId(rawRegion) ? rawRegion : rawRegion == null || rawRegion === "" ? "all" : null;
  const other = params.get("other");
  const geo = useGeolocation();
  const hospitals = useHospitals();
  const [sort, setSort] = useState<SortMode>(() => readSavedSort() ?? "distance");
  const [guide, setGuide] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const phase = hospitals.status;

  const hasGeo = geo.status === "ok";
  const geoFailed = geo.status === "denied" || geo.status === "timeout" || geo.status === "unsupported" || geo.status === "error";
  const origin = hasGeo ? { lat: geo.lat, lng: geo.lng } : null;
  const homeHref = homeQuery(part, region ?? "all", other);
  const partLabel = displayPartLabel(part, other);
  const title = `${regionLabel(region ?? "all")} · ${partLabel}`;

  const list = useMemo(() => {
    if (!region) return [];
    const base = hospitalsByRegion(hospitals.hospitals, region);
    return sortHospitals(base, hasGeo && sort === "distance" ? "distance" : "type", origin);
  }, [region, sort, hasGeo, origin, hospitals.hospitals]);

  useEffect(() => {
    if (phase === "ready" && list.length > 0 && geo.status === "idle") geo.request();
  }, [phase, list.length, geo.status, geo.request]);

  useEffect(() => {
    if (geo.status === "ok") track("location_permission", { result: "granted" }, "S2");
    if (geo.status === "denied") track("location_permission", { result: "denied" }, "S2");
    if (geo.status === "timeout") track("location_permission", { result: "timeout" }, "S2");
    if (geo.status === "unsupported") track("location_permission", { result: "unsupported" }, "S2");
  }, [geo.status]);

  useEffect(() => {
    const saved = readSavedSort();
    if (geoFailed) setSort("type");
    else if (hasGeo) setSort(saved ?? "distance");
  }, [hasGeo, geoFailed]);

  useEffect(() => {
    if (phase === "ready") {
      if (list.length === 0) track("no_result", { region: region ?? "", part, result_count: 0 }, "S5");
      else track("list_view", { region: region ?? "", part, result_count: list.length }, "S2");
      const y = sessionStorage.getItem(LIST_SCROLL_KEY);
      if (y) {
        const shell = document.querySelector(".app-shell");
        requestAnimationFrame(() => {
          if (shell) shell.scrollTop = Number(y);
          else window.scrollTo(0, Number(y));
        });
      }
    }
    if (phase === "error") track("list_error", { reason: "timeout" }, "S2");
  }, [phase, list.length, region, part]);

  const qs = listQuery(part, region ?? "all", other);

  function changeSort(mode: SortMode) {
    setSort(mode);
    sessionStorage.setItem(LIST_SORT_KEY, mode);
    track("sort_change", { sort: mode }, "S2");
  }

  const topbar = (
    <div className="topbar">
      <button type="button" className="icon-btn" onClick={() => router.push(homeHref)} aria-label="뒤로">
        ←
      </button>
      <div className="topbar-title">{title}</div>
      <button
        type="button"
        className="link-btn"
        onClick={() => {
          track("condition_change", {}, "S2");
          router.push(homeHref);
        }}
      >
        조건 변경
      </button>
    </div>
  );

  if (phase === "loading") return <LoadingState onBack={() => router.push(homeHref)} />;
  if (phase === "error") {
    return (
      <div className="page">
        <div className="page-body">
          {topbar}
          <ErrorState
            onRetry={() => {
              track("list_retry", {}, "S2");
              void hospitals.reload();
            }}
            onOtherRegion={() => router.push(homeHref)}
          />
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="page">
        <div className="page-body">
          <div className="topbar">
            <button type="button" className="icon-btn" onClick={() => router.push(homeHref)} aria-label="뒤로">
              ←
            </button>
          </div>
          <EmptyState
            regionName={regionLabel(region ?? "all")}
            onAllDaejeon={() => {
              track("no_result_action", { action: "all_daejeon" }, "S5");
              router.replace(`/hospitals?${listQuery(part, "all", other)}`);
            }}
            onOtherRegion={() => {
              track("no_result_action", { action: "other_region" }, "S5");
              router.push(homeHref);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-body">
        {topbar}
        <div className="result-row">
          <div className="result-count">
            {list.length}곳
            {hasGeo ? " · 📍 현재 위치 기준" : ""}
          </div>
          <SortChips
            value={hasGeo ? sort : "type"}
            distanceEnabled={hasGeo}
            onChange={changeSort}
          />
        </div>
        <div className="type-link-row">
          <button
            type="button"
            className="type-link"
            onClick={() => {
              setGuide(true);
              track("hospital_type_view", { from: "list" }, "S2");
            }}
          >
            병원 종류가 뭐예요?
          </button>
        </div>
        {geoFailed ? (
          <LocationBanner
            onRetry={() => {
              track("location_retry", {}, "S2");
              if (geo.status === "denied") {
                setToast(GEO_DENIED_TOAST);
                window.setTimeout(() => setToast(null), 2000);
              }
              geo.request();
            }}
          />
        ) : null}
        {list.map((hospital, index) => {
          let distanceLabel: string | null = null;
          if (origin) {
            distanceLabel =
              hospital.lat != null && hospital.lng != null
                ? formatDistance(haversineMeters(origin.lat, origin.lng, hospital.lat, hospital.lng))
                : "거리 –";
          }
          const href = `/hospitals/${encodeURIComponent(hospital.ykiho)}?${qs}`;
          return (
            <div
              key={hospital.ykiho}
              onClick={() => {
                saveListScroll();
                sessionStorage.setItem(LIST_SORT_KEY, hasGeo ? sort : "type");
                track(
                  "hospital_select",
                  {
                    ykiho: hospital.ykiho,
                    status: analyticsStatus(hospital.status),
                    position: index + 1,
                    distance_m:
                      origin && hospital.lat != null && hospital.lng != null
                        ? Math.round(haversineMeters(origin.lat, origin.lng, hospital.lat, hospital.lng))
                        : undefined,
                  },
                  "S2"
                );
              }}
            >
              <HospitalCard
                hospital={hospital}
                distanceLabel={distanceLabel}
                href={href}
                showDistrict={region === "all"}
              />
            </div>
          );
        })}
      </div>
      {guide ? <TypeGuideModal onClose={() => setGuide(false)} /> : null}
      {toast ? <Toast>{toast}</Toast> : null}
    </div>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ListInner />
    </Suspense>
  );
}
