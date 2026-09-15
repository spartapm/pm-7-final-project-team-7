"use client";

import { AvatarIcon, BackIcon, BellIcon } from "@/components/Icons";

export function BrandHeader({
  variant,
  onBack,
}: {
  variant: "home" | "list" | "detail";
  onBack?: () => void;
}) {
  return (
    <header className="brandbar">
      {variant === "detail" ? (
        <div className="brand-row">
          <div className="brand-left">
            <button type="button" className="header-icon" onClick={onBack} aria-label="뒤로">
              <BackIcon />
            </button>
            <div className="topbar-title">병원 상세</div>
          </div>
          <span className="avatar" aria-hidden>
            <AvatarIcon />
          </span>
        </div>
      ) : (
        <div className="brand-row">
          <div className="brand-left">
            <h1>이어</h1>
            <span className="ieo-badge">{variant === "list" ? "대전 MRI" : "IEO"}</span>
            {variant === "home" ? <span className="quiet-pill">MRI 안심 안내</span> : null}
          </div>
          <div className="header-actions">
            <span className="header-icon" role="img" aria-label="알림">
              <BellIcon />
            </span>
            <span className="avatar" aria-hidden>
              <AvatarIcon />
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
