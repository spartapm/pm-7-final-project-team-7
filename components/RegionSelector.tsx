"use client";

import { RegionCheckIcon } from "@/components/Icons";
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
      {PICK_REGIONS.map((region) => {
        const selected = value === region.id;
        return (
          <button
            key={region.id}
            type="button"
            className="region-chip"
            aria-pressed={selected}
            onClick={() => onChange(region.id)}
          >
            {selected ? <RegionCheckIcon /> : null}
            {region.pickLabel}
          </button>
        );
      })}
    </div>
  );
}
