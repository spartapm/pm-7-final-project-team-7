"use client";

import { PART_GROUPS } from "@/lib/constants";
import type { PartGroupId, PartId } from "@/lib/types";

export function PartSelector({
  group,
  part,
  onGroupChange,
  onPartChange,
}: {
  group: PartGroupId | null;
  part: PartId | null;
  onGroupChange: (id: PartGroupId) => void;
  onPartChange: (id: PartId) => void;
}) {
  const open = PART_GROUPS.find((item) => item.id === group);

  return (
    <>
      <div className="chip-grid">
        {PART_GROUPS.map((item) => {
          const selected = group === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={selected}
              onClick={() => onGroupChange(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {open ? (
        <div className={`subpart-panel sub-${open.id}`}>
          <div className="subpart-head">
            <strong>{open.label} 세부 부위 선택</strong>
            <span>세부 부위를 선택해주세요</span>
          </div>
          <div className="subpart-chips">
            {open.parts.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip small"
                aria-pressed={part === item.id}
                onClick={() => onPartChange(item.id)}
              >
                {item.buttonLabel ?? item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
