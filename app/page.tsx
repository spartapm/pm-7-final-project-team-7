"use client";

import { PartSelector } from "@/components/PartSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RegionSelector } from "@/components/RegionSelector";
import {
  APP_NAME,
  HOME_SCROLL_KEY,
  LIST_SCROLL_KEY,
  LIST_SORT_KEY,
  REGION_SCOPE_NOTE,
  SOURCE_FOOTER,
  displayPartLabel,
  isOtherPartId,
  isPartId,
  isRegionId,
  listQuery,
} from "@/lib/constants";
import { track } from "@/lib/analytics";
import type { OtherPartId, PartId, RegionId } from "@/lib/types";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS } from "@/lib/constants";

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [part, setPart] = useState<PartId | null>(null);
  const [other, setOther] = useState<OtherPartId | null>(null);
  const [etcOpen, setEtcOpen] = useState(false);
  const [region, setRegion] = useState<RegionId | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const nextPart = params.get("part");
    const nextRegion = params.get("region");
    const nextOther = params.get("other");
    if (isPartId(nextPart) && nextPart !== "other") setPart(nextPart);
    if (isPartId(nextPart) && nextPart === "other") {
      setEtcOpen(true);
      if (isOtherPartId(nextOther)) {
        setPart("other");
        setOther(nextOther);
      }
    }
    if (isRegionId(nextRegion)) setRegion(nextRegion);
    track("service_view", { entry: nextPart || nextRegion ? "back" : "first" }, "S1");
    if (!(nextPart || nextRegion)) return;
    const y = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (y) {
      const shell = document.querySelector(".app-shell");
      requestAnimationFrame(() => {
        if (shell) shell.scrollTop = Number(y);
        else window.scrollTo(0, Number(y));
      });
    }
  }, [params]);

  const partReady = part && (part !== "other" || other);
  const ctaLabel = useMemo(() => {
    if (partReady && region) {
      const regionText = REGIONS.find((item) => item.id === region)?.label ?? "";
      return `${regionText} · ${displayPartLabel(part, other)} MRI 병원 찾기`;
    }
    return "병원 찾기";
  }, [part, other, partReady, region]);

  function submit() {
    if (!partReady || !region) {
      setBlocked(true);
      track("search_blocked", { missing: !partReady && !region ? "both" : !partReady ? "part" : "region" }, "S1");
      const target = !partReady ? document.getElementById("section-part") : document.getElementById("section-region");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setBlocked(false);
    const shell = document.querySelector(".app-shell");
    sessionStorage.setItem(HOME_SCROLL_KEY, String(shell ? shell.scrollTop : window.scrollY));
    sessionStorage.removeItem(LIST_SORT_KEY);
    sessionStorage.removeItem(LIST_SCROLL_KEY);
    track("search_submit", { region, part: partReady }, "S1");
    router.push(`/hospitals?${listQuery(part, region, other)}`);
  }

  return (
    <div className="page">
      <div className="brandbar">
        <div className="brand">
          <h1>{APP_NAME}</h1>
        </div>
      </div>
      <div className="page-body">
        <div className="hero">
          <h2>MRI, 어디서 찍을 수 있나요?</h2>
          <p>MRI 장비가 있는 병원을 찾아드려요.</p>
        </div>

        <div className="section-label" id="section-part">
          어느 부위를 찍으시나요?
        </div>
        <PartSelector
          value={part}
          otherValue={other}
          etcOpen={etcOpen}
          onChange={(id) => {
            setPart(id);
            setEtcOpen(false);
            setOther(null);
            setBlocked(false);
            track("part_select", { part: id }, "S1");
          }}
          onOtherChange={(id) => {
            setPart("other");
            setOther(id);
            setBlocked(false);
            track("part_select", { part: id }, "S1");
          }}
          onEtcOpen={() => {
            setEtcOpen(true);
            if (part !== "other") {
              setPart(null);
              setOther(null);
            }
            track("part_etc_open", {}, "S1");
          }}
        />

        <div className="section-label" id="section-region">
          어느 지역에서 찾아볼까요?
        </div>
        <RegionSelector
          value={region}
          onChange={(id) => {
            setRegion(id);
            setBlocked(false);
            track("region_select", { region: id }, "S1");
          }}
        />

        <p className="footer-note">{REGION_SCOPE_NOTE}</p>
        <p className="footer-note" style={{ marginTop: 8 }}>
          {SOURCE_FOOTER}
        </p>
      </div>

      <div className="sticky-cta">
        <PrimaryButton onClick={submit}>{ctaLabel}</PrimaryButton>
        {blocked ? <p className="hint">⚠ 지역과 부위를 모두 선택해주세요</p> : null}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
