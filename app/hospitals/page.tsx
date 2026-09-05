"use client";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { HospitalCard } from "@/components/HospitalCard";
import { LoadingState } from "@/components/LoadingState";
import { LocationBanner } from "@/components/LocationBanner";
import { SortChips } from "@/components/SortChips";
import { TypeGuideModal } from "@/components/TypeGuideModal";
import { track } from "@/lib/analytics";
import {
  LIST_SCROLL_KEY,
  PARTS,
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
  const [sort, setSort] = useState<SortMode>("distance");
  const [guide, setGuide] = useState(false);
  const phase = hospitals.status;

  const hasGeo = geo.status === "ok";
  const origin = hasGeo ? { lat: geo.lat, lng: geo.lng } : null;
  const homeHref = homeQuery(part, region ?? "all", other);

  useEffect(() => {
    if (geo.status === "ok") track("location_permission", { result: "granted" }, "S2");
    if (geo.status === "denied") track("location_permission", { result: "denied" }, "S2");
    if (geo.status === "timeout") track("location_permission", { result: "timeout" }, "S2");
    if (geo.status === "unsupported") track("location_permission", { result: "unsupported" }, "S2");
  }, [geo.status]);

  useEffect(() => {
    if (!hasGeo && geo.status !== "loading" && geo.status !== "idle") {
      setSort("type");
    }
    if (hasGeo) setSort("distance");
  }, [hasGeo, geo.status]);

  const list = useMemo(() => {
    if (!region) return [];
    const base = hospitalsByRegion(hospitals.hospitals, region);
    return sortHospitals(base, hasGeo ? sort : "type", origin);
  }, [region, sort, hasGeo, origin, hospitals.hospitals]);

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

  const partLabel = PARTS.find((item) => item.id === part)?.label ?? "MRI";
  const qs = listQuery(part, region ?? "all", other);

  if (phase === "loading") return <LoadingState />;
  if (phase === "error") {
    return (
      <div className="page">
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
        <div className="page-body">
          <EmptyState
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
        <div className="topbar">
          <button type="button" className="icon-btn" onClick={() => router.push(homeHref)} aria-label="뒤로">
            ←
          </button>
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
        <h1 className="lede" style={{ marginTop: 0 }}>
          {regionLabel(region ?? "all")} {partLabel} MRI
        </h1>
        <p className="sub">MRI 장비가 확인된 병원 {list.length}곳 · 국가 공개 정보 기반</p>
        <SortChips
          value={hasGeo ? sort : "type"}
          distanceEnabled={hasGeo}
          onChange={(mode) => {
            setSort(mode);
            track("sort_change", { sort: mode }, "S2");
          }}
        />
        {!hasGeo ? (
          <LocationBanner
            onRetry={() => {
              track("location_retry", {}, "S2");
              geo.request();
            }}
          />
        ) : null}
        {list.map((hospital, index) => {
          const distanceLabel =
            origin && hospital.lat != null && hospital.lng != null
              ? formatDistance(haversineMeters(origin.lat, origin.lng, hospital.lat, hospital.lng))
              : null;
          const href = `/hospitals/${encodeURIComponent(hospital.ykiho)}?${qs}`;
          return (
            <div
              key={hospital.ykiho}
              onClick={() => {
                saveListScroll();
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
        <button
          type="button"
          className="link-btn"
          style={{ marginLeft: 0, marginTop: 8, marginBottom: 8 }}
          onClick={() => {
            setGuide(true);
            track("hospital_type_view", { from: "list" }, "S2");
          }}
        >
          병원 종류가 뭐예요?
        </button>
      </div>
      {guide ? <TypeGuideModal onClose={() => setGuide(false)} /> : null}
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
