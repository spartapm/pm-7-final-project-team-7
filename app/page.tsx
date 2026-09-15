"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { CalendarIcon, CtaArrowIcon, HiraCheckIcon } from "@/components/Icons";
import { PartSelector } from "@/components/PartSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RegionSelector } from "@/components/RegionSelector";
import { TabBar } from "@/components/TabBar";
import {
  HOME_SCROLL_KEY,
  LIST_SORT_KEY,
  REGION_SCOPE_NOTE,
  REGION_SCOPE_SUB,
  displayPartLabel,
  groupOf,
  isRegionId,
  listQuery,
  resolveGroup,
  resolvePart,
} from "@/lib/constants";
import { forgetListHospital } from "@/lib/list-memory";
import { track } from "@/lib/analytics";
import type { PartGroupId, PartId, RegionId } from "@/lib/types";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS } from "@/lib/constants";

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [group, setGroup] = useState<PartGroupId | null>(null);
  const [part, setPart] = useState<PartId | null>(null);
  const [region, setRegion] = useState<RegionId | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const nextPart = resolvePart(params.get("part"), params.get("group"), params.get("other"));
    const nextGroup = resolveGroup(params.get("part"), params.get("group"), params.get("other"));
    const nextRegion = params.get("region");
    if (nextGroup) setGroup(nextGroup);
    if (nextPart) setPart(nextPart);
    if (isRegionId(nextRegion) && nextRegion !== "all") setRegion(nextRegion);
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

  const partReady = Boolean(part);
  const ctaLabel = useMemo(() => {
    if (partReady && region && part) {
      const regionText = REGIONS.find((item) => item.id === region)?.label ?? "";
      return `대전 ${regionText} · ${displayPartLabel(part)} MRI 병원 보기`;
    }
    return "병원 보기";
  }, [part, partReady, region]);

  function submit() {
    if (!part || !region) {
      setBlocked(true);
      track("search_blocked", { missing: !part && !region ? "both" : !part ? "part" : "region" }, "S1");
      const target = !part ? document.getElementById("section-part") : document.getElementById("section-region");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setBlocked(false);
    const shell = document.querySelector(".app-shell");
    sessionStorage.setItem(HOME_SCROLL_KEY, String(shell ? shell.scrollTop : window.scrollY));
    sessionStorage.removeItem(LIST_SORT_KEY);
    forgetListHospital();
    track("search_submit", { region, part }, "S1");
    router.push(`/hospitals?${listQuery(part, region, group)}`);
  }

  return (
    <div className="page page-home">
      <BrandHeader variant="home" />
      <div className="page-body">
        <div className="hero">
          <div className="hero-top">
            <span className="hero-kicker">대전 특화 안내</span>
            <CalendarIcon />
          </div>
          <h2>
            MRI, 어디서 찍을 수
            <br />
            있나요?
          </h2>
          <p>우리 동네 MRI 보유 병원과 촬영 장비 정보를 투명하게 비교해보세요.</p>
          <div className="hero-meta">
            <span className="hero-meta-left">
              <HiraCheckIcon />
              건강보험심사평가원 최신 공공데이터
            </span>
            <span className="hero-chip">100 % 공공 기반</span>
          </div>
        </div>

        <div className="section-head" id="section-part">
          <div className="section-label">어느 부위를 찍으시나요?</div>
          <span className="section-hint">대분류 & 세부 부위</span>
        </div>
        <PartSelector
          group={group}
          part={part}
          onGroupChange={(id) => {
            setGroup(id);
            if (part && groupOf(part) !== id) setPart(null);
            setBlocked(false);
            track("part_group_select", { group: id }, "S1");
          }}
          onPartChange={(id) => {
            setPart(id);
            setGroup(groupOf(id));
            setBlocked(false);
            track("part_select", { part: id }, "S1");
          }}
        />

        <div className="section-head" id="section-region">
          <div className="section-label">어느 지역에서 찾아볼까요?</div>
          <span className="section-hint">5개 구 지원</span>
        </div>
        <RegionSelector
          value={region}
          onChange={(id) => {
            setRegion(id);
            setBlocked(false);
            track("region_select", { region: id }, "S1");
          }}
        />

        <div className="scope-box">
          <p>{REGION_SCOPE_NOTE}</p>
          <p className="scope-sub">{REGION_SCOPE_SUB}</p>
        </div>

        <div className="home-cta">
          <PrimaryButton onClick={submit} icon={<CtaArrowIcon />}>
            {ctaLabel}
          </PrimaryButton>
          {blocked ? <p className="hint">지역과 부위를 모두 선택해주세요</p> : null}
        </div>
      </div>
      <TabBar active="home" />
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
