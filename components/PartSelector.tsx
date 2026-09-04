"use client";

import { OTHER_PARTS, PARTS } from "@/lib/constants";
import type { OtherPartId, PartId } from "@/lib/types";

export function PartSelector({
  value,
  otherValue,
  onChange,
  onOtherChange,
  onEtcOpen,
}: {
  value: PartId | null;
  otherValue: OtherPartId | null;
  onChange: (id: PartId) => void;
  onOtherChange: (id: OtherPartId) => void;
  onEtcOpen: () => void;
}) {
  return (
    <>
      <div className="chip-grid">
        {PARTS.map((part) => (
          <button
            key={part.id}
            type="button"
            className="chip"
            aria-pressed={value === part.id}
            onClick={() => {
              onChange(part.id);
              if (part.id === "other") onEtcOpen();
            }}
          >
            {part.label}
          </button>
        ))}
      </div>
      {value === "other" ? (
        <div className="chip-list">
          {OTHER_PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              className="chip small"
              aria-pressed={otherValue === part.id}
              onClick={() => onOtherChange(part.id)}
            >
              {part.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
