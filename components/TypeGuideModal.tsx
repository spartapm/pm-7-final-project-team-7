"use client";

import { TYPE_GUIDE } from "@/lib/constants";

export function TypeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="sheet type-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <h2>{TYPE_GUIDE.title}</h2>
        <div className="guide-list">
          {TYPE_GUIDE.body.map((item) => (
            <div className="guide-item" key={item.title}>
              <div className="guide-item-title">{item.title}</div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <p className="limit-note">{TYPE_GUIDE.note}</p>
      </div>
    </div>
  );
}
