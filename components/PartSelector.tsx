"use client";

import { OTHER_PARTS, PARTS } from "@/lib/constants";
import type { OtherPartId, PartId } from "@/lib/types";

export function PartSelector({
  value,
  otherValue,
  etcOpen,
  onChange,
  onOtherChange,
  onEtcOpen,
}: {
  value: PartId | null;
  otherValue: OtherPartId | null;
  etcOpen: boolean;
  onChange: (id: PartId) => void;
  onOtherChange: (id: OtherPartId) => void;
  onEtcOpen: () => void;
}) {
  return (
    <>
      <div className="chip-grid">
        {PARTS.map((part) => {
          const isEtc = part.id === "other";
          const pressed = isEtc ? etcOpen : value === part.id;
          return (
            <button
              key={part.id}
              type="button"
              className={`chip${isEtc && etcOpen ? " etc-open" : ""}`}
              aria-pressed={pressed}
              onClick={() => {
                if (isEtc) onEtcOpen();
                else onChange(part.id);
              }}
            >
              {isEtc && etcOpen ? "그 외 ▾" : part.label}
            </button>
          );
        })}
      </div>
      {etcOpen ? (
        <div className="subpart-panel">
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
