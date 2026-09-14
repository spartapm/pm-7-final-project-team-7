"use client";

import { PICK_REGIONS } from "@/lib/constants";
import type { RegionId } from "@/lib/types";

export function RegionSelector({
  value,
  onChange,
}: {
  value: RegionId | null;
  onChange: (id: RegionId) => void;
}) {
  return (
    <div className="region-grid">
      {PICK_REGIONS.map((region) => (
        <button
          key={region.id}
          type="button"
          className="region-chip"
          aria-pressed={value === region.id}
          onClick={() => onChange(region.id)}
        >
          {region.pickLabel}
        </button>
      ))}
    </div>
  );
}
