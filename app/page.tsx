"use client";

import { PartSelector } from "@/components/PartSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RegionSelector } from "@/components/RegionSelector";
import {
  APP_NAME,
  APP_NAME_EN,
  PARTS,
  SOURCE_FOOTER,
  isOtherPartId,
  isPartId,
  isRegionId,
  listQuery,
} from "@/lib/constants";
import { track } from "@/lib/analytics";
import type { OtherPartId, PartId, RegionId } from "@/lib/types";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [part, setPart] = useState<PartId | null>(null);
  const [other, setOther] = useState<OtherPartId | null>(null);
  const [region, setRegion] = useState<RegionId | null>(null);
  const [blocked, setBlocked] = useState<"part" | "region" | "both" | null>(null);

  useEffect(() => {
    const nextPart = params.get("part");
    const nextRegion = params.get("region");
    const nextOther = params.get("other");
    if (isPartId(nextPart)) setPart(nextPart);
    if (isRegionId(nextRegion)) setRegion(nextRegion);
    if (isOtherPartId(nextOther)) setOther(nextOther);
    track("service_view", { entry: nextPart || nextRegion ? "back" : "first" }, "S1");
  }, [params]);

  const question = useMemo(() => {
    if (!part) return "어느 부위 MRI가 필요하세요?";
    return PARTS.find((item) => item.id === part)?.question ?? "";
  }, [part]);

  function submit() {
    if (!part && !region) {
      setBlocked("both");
      track("search_blocked", { missing: "both" }, "S1");
      return;
    }
    if (!part) {
      setBlocked("part");
      track("search_blocked", { missing: "part" }, "S1");
      return;
    }
    if (!region) {
      setBlocked("region");
      track("search_blocked", { missing: "region" }, "S1");
      return;
    }
    setBlocked(null);
    track("search_submit", { region, part }, "S1");
    router.push(`/hospitals?${listQuery(part, region, other)}`);
  }

  return (
    <div className="page">
      <div className="page-body">
        <div className="brand">
          <h1>{APP_NAME}</h1>
          <span>{APP_NAME_EN} · 대전 MRI</span>
        </div>
        <p className="lede">{question}</p>
        <p className="sub">부위와 지역만 고르면, MRI 장비가 확인된 병원을 가까운 순으로 보여 드립니다.</p>

        <div className="section-label">부위</div>
        <PartSelector
          value={part}
          otherValue={other}
          onChange={(id) => {
            setPart(id);
            track("part_select", { part: id }, "S1");
            if (id !== "other") setOther(null);
          }}
          onOtherChange={(id) => setOther(id)}
          onEtcOpen={() => track("part_etc_open", {}, "S1")}
        />

        <div className="section-label">지역</div>
        <RegionSelector
          value={region}
          onChange={(id) => {
            setRegion(id);
            track("region_select", { region: id }, "S1");
          }}
        />

        {blocked ? (
          <p className="hint">
            {blocked === "part"
              ? "부위를 먼저 선택해 주세요."
              : blocked === "region"
                ? "지역을 선택해 주세요."
                : "부위와 지역을 모두 선택해 주세요."}
          </p>
        ) : null}

        <p className="footer-note">{SOURCE_FOOTER}. 실제 검사 가능 여부는 병원에 확인해 주세요.</p>
      </div>

      <div className="sticky-cta">
        <PrimaryButton onClick={submit}>병원 찾기</PrimaryButton>
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
