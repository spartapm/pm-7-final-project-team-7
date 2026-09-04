"use client";

import type { SortMode } from "@/lib/types";

export function SortChips({
  value,
  onChange,
  distanceEnabled,
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  distanceEnabled: boolean;
}) {
  return (
    <div className="sort-row">
      <button
        type="button"
        className="sort-chip"
        aria-pressed={value === "distance"}
        disabled={!distanceEnabled}
        onClick={() => onChange("distance")}
      >
        가까운 순
      </button>
      <button
        type="button"
        className="sort-chip"
        aria-pressed={value === "type"}
        onClick={() => onChange("type")}
      >
        병원 종류 순
      </button>
    </div>
  );
}
