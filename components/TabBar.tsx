"use client";

import Link from "next/link";

export function TabBar({ active }: { active: "home" | "nearby" }) {
  return (
    <nav className="tabbar" aria-label="하단 메뉴">
      <Link className={`tab-item${active === "home" ? " is-active" : ""}`} href="/">
        <span className="tab-icon" aria-hidden>
          ⌂
        </span>
        홈
      </Link>
      <Link className={`tab-item${active === "nearby" ? " is-active" : ""}`} href="/hospitals?region=all&group=brain&part=brain">
        <span className="tab-icon" aria-hidden>
          ◎
        </span>
        내 주변 병원
      </Link>
    </nav>
  );
}
