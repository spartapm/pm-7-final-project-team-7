"use client";

import { NONPAY_SHEET_NOTE } from "@/lib/constants";
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

  useEffect(() => {
    setTarget(document.body);
    const shell = document.querySelector(".app-shell");
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    let freeze: (() => void) | undefined;
    if (shell instanceof HTMLElement) {
      const saved = shell.scrollTop;
      shell.classList.add("is-modal-locked");
      freeze = () => {
        if (shell.scrollTop !== saved) shell.scrollTop = saved;
      };
      shell.addEventListener("scroll", freeze);
    }
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      if (shell instanceof HTMLElement) {
        shell.classList.remove("is-modal-locked");
        if (freeze) shell.removeEventListener("scroll", freeze);
      }
    };
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
        <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <h2 id="nonpay-title">{title}</h2>
        <p className="sub" style={{ marginTop: 0 }}>
          선택한 부위 기준으로 공개된 MRI 비급여 항목입니다.
        </p>
        <ul className="nonpay-list">
          {items.length ? (
            items.map((item) => (
              <li key={item.name}>
                <span className="nonpay-name">{item.name}</span>
                <span className="nonpay-price">{item.price ?? "확인 필요"}</span>
              </li>
            ))
          ) : (
            <li>
              <span className="nonpay-name">이 부위로 공개된 MRI 비급여 항목을 확인하지 못했어요.</span>
              <span className="nonpay-price">확인 필요</span>
            </li>
          )}
        </ul>
        <p className="nonpay-sheet-note">{NONPAY_SHEET_NOTE}</p>
      </div>
    </div>,
    target
  );
}
