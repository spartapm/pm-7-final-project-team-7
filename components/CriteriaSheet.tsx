"use client";

import { useLockAppScroll } from "@/hooks/useLockAppScroll";
import { JUDGMENT_SHEET_ITEMS, JUDGMENT_SHEET_LEAD, JUDGMENT_SHEET_TITLE } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CriteriaSheet({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const startY = useRef(0);
  useLockAppScroll();

  useEffect(() => {
    setTarget(document.body);
  }, []);

  if (!target) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet criteria-sheet"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          startY.current = event.touches[0]?.clientY ?? 0;
        }}
        onTouchEnd={(event) => {
          const y = event.changedTouches[0]?.clientY ?? 0;
          if (y - startY.current > 80) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="criteria-title"
      >
        <div className="sheet-handle" aria-hidden />
        <div className="nonpay-sheet-head">
          <h2 id="criteria-title">{JUDGMENT_SHEET_TITLE}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <p className="criteria-lead">{JUDGMENT_SHEET_LEAD}</p>
        <div className="criteria-cards">
          {JUDGMENT_SHEET_ITEMS.map((item) => (
            <article key={item.status} className={`criteria-card is-${item.status}`}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>,
    target
  );
}
