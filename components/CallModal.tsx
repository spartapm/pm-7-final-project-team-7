"use client";

import { useLockAppScroll } from "@/hooks/useLockAppScroll";
import { CALL_GUIDES } from "@/lib/constants";
import { canDial, telHref } from "@/lib/phone";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PhoneIcon } from "./Icons";
import { Toast } from "./Toast";

export function CallModal({
  name,
  phone,
  partLabel,
  onClose,
  onCall,
  onCopy,
}: {
  name: string;
  phone: string;
  partLabel?: string;
  onClose: () => void;
  onCall: () => void;
  onCopy: () => void | Promise<void>;
}) {
  const telOk = canDial(phone);
  const [copied, setCopied] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const firstQuestion = partLabel ? `${partLabel} MRI 검사 받을 수 있나요?` : CALL_GUIDES[0];
  useLockAppScroll({ lockTouch: true });

  useEffect(() => {
    setTarget(document.body);
  }, []);

  async function copy() {
    await onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!target) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="sheet call-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal>
        <p className="sheet-name">{name}</p>
        <p className="sheet-phone num">{phone}</p>
        <div className="guide">
          <span>물어볼 말</span>
          {firstQuestion}
          <br />
          {CALL_GUIDES[1]}
        </div>
        {telOk ? (
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              취소
            </button>
            <a
              className="primary-btn btn-with-icon"
              href={telHref(phone)}
              onClick={onCall}
            >
              <PhoneIcon />
              전화하기
            </a>
          </div>
        ) : (
          <button type="button" className="primary-btn" onClick={() => void copy()}>
            전화번호 복사
          </button>
        )}
        {telOk ? (
          <button type="button" className="copy-link" onClick={() => void copy()}>
            전화번호 복사하기
          </button>
        ) : (
          <button type="button" className="ghost-btn" style={{ marginTop: 8 }} onClick={onClose}>
            취소
          </button>
        )}
      </div>
      {copied ? <Toast>번호를 복사했어요</Toast> : null}
    </div>,
    target
  );
}
