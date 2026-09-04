"use client";

import { TYPE_GUIDE } from "@/lib/constants";

export function TypeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <h2>{TYPE_GUIDE.title}</h2>
        {TYPE_GUIDE.body.map((item) => (
          <p key={item.title}>
            <b>{item.title}</b>
            <br />
            {item.text}
          </p>
        ))}
        <p className="sub">{TYPE_GUIDE.note}</p>
        <button type="button" className="primary-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
