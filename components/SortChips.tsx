"use client";

import { CardChevronIcon, ListInfoIcon } from "@/components/Icons";
import type { SortMode } from "@/lib/types";

export function SortChips({
  value,
  onChange,
  distanceEnabled,
  onCriteria,
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  distanceEnabled: boolean;
  onCriteria?: () => void;
}) {
  return (
    <div className="sort-row">
      <div className="sort-chips">
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
      {onCriteria ? (
        <button type="button" className="criteria-open" onClick={onCriteria}>
          <ListInfoIcon />
          검사 판정 기준
          <CardChevronIcon />
        </button>
      ) : null}
    </div>
  );
}
