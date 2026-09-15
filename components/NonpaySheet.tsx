"use client";

import { ExamItemIcon, InfoIcon } from "@/components/Icons";
import { useLockAppScroll } from "@/hooks/useLockAppScroll";
import { NONPAY_SHEET_NOTE } from "@/lib/constants";
import { displayItemLabel } from "@/lib/nonpay";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function NonpaySheet({
  title,
  items,
  onClose,
}: {
  title: string;
  items: { name: string; price?: string }[];
  onClose: () => void;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLockAppScroll();

  useEffect(() => {
    setTarget(document.body);
  }, []);

  if (!target) return null;

  return createPortal(
    <div className="modal-backdrop nonpay-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet nonpay-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nonpay-title"
      >
        <div className="nonpay-sheet-head">
          <h2 id="nonpay-title">{title}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <p className="nonpay-sheet-sub">선택한 부위 기준으로 공개된 MRI 비급여 항목입니다.</p>
        <ul className="nonpay-list">
          {items.length ? (
            items.map((item, index) => {
              const label = displayItemLabel(item.name);
              return (
                <li key={item.name}>
                  <span className="nonpay-ico">
                    <ExamItemIcon index={index} />
                  </span>
                  <span className="nonpay-copy">
                    <span className="nonpay-name">{label.title}</span>
                    {label.subtitle ? <span className="nonpay-sub">{label.subtitle}</span> : null}
                  </span>
                  <span className="nonpay-price">{item.price ?? "확인 필요"}</span>
                </li>
              );
            })
          ) : (
            <li>
              <span className="nonpay-ico">
                <ExamItemIcon index={0} />
              </span>
              <span className="nonpay-copy">
                <span className="nonpay-name">이 부위로 공개된 MRI 비급여 항목을 확인하지 못했어요.</span>
              </span>
              <span className="nonpay-price">확인 필요</span>
            </li>
          )}
        </ul>
        <div className="nonpay-sheet-note">
          <InfoIcon />
          <p>{NONPAY_SHEET_NOTE}</p>
        </div>
      </div>
    </div>,
    target
  );
}
