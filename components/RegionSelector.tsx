"use client";

import { REGIONS } from "@/lib/constants";
import type { RegionId } from "@/lib/types";

export function RegionSelector({
  value,
  onChange,
}: {
  value: RegionId | null;
  onChange: (id: RegionId) => void;
}) {
  return (
    <div className="region-list">
      {REGIONS.map((region) => (
        <button
          key={region.id}
          type="button"
          className="region-row"
          aria-pressed={value === region.id}
          onClick={() => onChange(region.id)}
        >
          <span>{region.pickLabel}</span>
          <span className="region-check" aria-hidden>
            {value === region.id ? "✓" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
