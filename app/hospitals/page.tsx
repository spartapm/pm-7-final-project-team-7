"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { HospitalCard } from "@/components/HospitalCard";
import { ListInfoIcon, PinIcon, SlidersIcon } from "@/components/Icons";
import { ListWhisper } from "@/components/ListWhisper";
import { LoadingState } from "@/components/LoadingState";
import { LocationBanner } from "@/components/LocationBanner";
import { SortChips } from "@/components/SortChips";
import { Toast } from "@/components/Toast";
import { track } from "@/lib/analytics";
import {
  GEO_DENIED_TOAST,
  LIST_GUIDE,
  LIST_SCROLL_KEY,
  LIST_SORT_KEY,
  displayPartLabel,
  groupOf,
  homeQuery,
  isRegionId,
  listQuery,
  resolveGroup,
  resolvePart,
} from "@/lib/constants";
import { formatDistance, haversineMeters } from "@/lib/distance";
import { hospitalsByRegion, regionLabel, sortHospitals } from "@/lib/hospitals";
import { forgetListHospital, readListHospital, scrollListHospitalIntoView } from "@/lib/list-memory";
import { isDemoError, isDemoLoading, DEMO_LOADING_MS } from "@/lib/demo";
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
  const rawGroup = params.get("group");
  const rawOther = params.get("other");
  const part = resolvePart(rawPart, rawGroup, rawOther) ?? "lumbar";
  const group = resolveGroup(rawPart, rawGroup, rawOther) ?? groupOf(part);
  const region = isRegionId(rawRegion) ? rawRegion : rawRegion == null || rawRegion === "" ? "all" : null;
  const geo = useGeolocation();
  const hospitals = useHospitals();
  const [sort, setSort] = useState<SortMode>(() => readSavedSort() ?? "distance");
  const [toast, setToast] = useState<string | null>(null);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const demoLoading = isDemoLoading(part, region);
  const demoError = isDemoError(part, region);
  const [demoHold, setDemoHold] = useState(demoLoading);
  const phase = hospitals.status;

  useEffect(() => {
    if (!demoLoading) {
      setDemoHold(false);
      return;
    }
    setDemoHold(true);
    const timer = window.setTimeout(() => setDemoHold(false), DEMO_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [demoLoading]);

  const hasGeo = geo.status === "ok";
  const geoFailed = geo.status === "denied" || geo.status === "timeout" || geo.status === "unsupported" || geo.status === "error";
  const origin = hasGeo ? { lat: geo.lat, lng: geo.lng } : null;
  const homeHref = homeQuery(part, region ?? "all", group);
  const partLabel = displayPartLabel(part);
  const regionText = region === "all" || !region ? "대전 전체" : `대전 ${regionLabel(region)}`;

  const list = useMemo(() => {
    if (!region) return [];
    const base = hospitalsByRegion(hospitals.hospitals, region);
    return sortHospitals(base, hasGeo && sort === "distance" ? "distance" : "type", origin);
  }, [region, sort, hasGeo, origin, hospitals.hospitals]);

  useEffect(() => {
    if (phase === "ready" && list.length > 0 && geo.status === "idle" && !demoHold && !demoError) geo.request();
  }, [phase, list.length, geo.status, geo.request, demoHold, demoError]);

  useEffect(() => {
    if (geo.status === "ok") track("location_permission", { result: "granted" }, "S2");
    if (geo.status === "denied") track("location_permission", { result: "denied" }, "S2");
    if (geo.status === "timeout" || geo.status === "error") track("location_permission", { result: "timeout" }, "S2");
    if (geo.status === "unsupported") track("location_permission", { result: "unsupported" }, "S2");
  }, [geo.status]);

  useEffect(() => {
    const saved = readSavedSort();
    if (geoFailed) setSort("type");
    else if (hasGeo) setSort(saved ?? "distance");
  }, [hasGeo, geoFailed]);

  useEffect(() => {
    if (phase === "ready") {
      if (list.length === 0) track("no_result", { region: region ?? "", part }, "S5");
      else track("list_view", { region: region ?? "", part, result_count: list.length }, "S2");
    }
    if (phase === "error") track("list_error", { reason: "timeout" }, "S2");
  }, [phase, list.length, region, part]);

  useEffect(() => {
    if (phase !== "ready" || list.length === 0 || demoHold) return;
    const focusedYkiho = readListHospital() ?? "";
    if (!focusedYkiho) return;
    forgetListHospital();
    const frame = requestAnimationFrame(() => {
      scrollListHospitalIntoView(focusedYkiho);
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, list, demoHold]);

  const qs = listQuery(part, region ?? "all", group);

  function changeSort(mode: SortMode) {
    setSort(mode);
    sessionStorage.setItem(LIST_SORT_KEY, mode);
    track("sort_change", { sort: mode }, "S2");
  }

  function goHome() {
    track("condition_change", {}, "S2");
    router.push(homeHref);
  }

  const filter = (
    <div className="filter-bar">
      <div className="filter-chip">
        <div>
          <PinIcon />
          <strong>{regionText}</strong>
          <em>•</em>
          <span>{partLabel} MRI</span>
        </div>
        <button type="button" className="filter-change" onClick={goHome}>
          조건 변경
          <SlidersIcon />
        </button>
      </div>
      <SortChips
        value={hasGeo ? sort : "type"}
        distanceEnabled={hasGeo}
        onChange={changeSort}
        onCriteria={() => setCriteriaOpen(true)}
      />
    </div>
  );

  if (demoError) {
    return (
      <div className="page">
        <BrandHeader variant="list" onBack={goHome} />
        <div className="page-body">
          <ErrorState
            onRetry={() => {
              track("list_retry", { demo: true }, "S2");
            }}
            onOtherRegion={() => router.push(homeHref)}
          />
        </div>
      </div>
    );
  }

  if (phase === "loading" || demoHold) return <LoadingState onBack={() => router.push(homeHref)} />;
  if (phase === "error") {
    return (
      <div className="page">
        <BrandHeader variant="list" onBack={goHome} />
        <div className="page-body">
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
        <BrandHeader variant="list" onBack={goHome} />
        <div className="page-body">
          <EmptyState
            regionName={regionLabel(region ?? "all")}
            onAllDaejeon={() => {
              track("no_result_action", { action: "all_daejeon" }, "S5");
              router.replace(`/hospitals?${listQuery(part, "all", group)}`);
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
      <BrandHeader variant="list" onBack={goHome} />
      {filter}
      <div className="page-body page-body-list">
        <ListWhisper />
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
              data-ykiho={hospital.ykiho}
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
              <HospitalCard hospital={hospital} distanceLabel={distanceLabel} href={href} />
            </div>
          );
        })}
        <div className="list-guide">
          <ListInfoIcon />
          <p>
            <strong>안내 사항</strong>
            {LIST_GUIDE}
          </p>
        </div>
      </div>
      {criteriaOpen ? <CriteriaSheet onClose={() => setCriteriaOpen(false)} /> : null}
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
