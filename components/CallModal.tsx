"use client";

import { CALL_GUIDE } from "@/lib/constants";
import { canUseTel, telHref } from "@/lib/phone";
import { useState } from "react";

export function CallModal({
  name,
  phone,
  onClose,
  onCall,
  onCopy,
}: {
  name: string;
  phone: string;
  onClose: () => void;
  onCall: () => void;
  onCopy: () => void | Promise<void>;
}) {
  const telOk = canUseTel();
  const [copied, setCopied] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal>
        <h2>전화하기 전에</h2>
        <p className="sheet-name">{name}</p>
        <p className="num">{phone}</p>
        <div className="guide">물어볼 말: “{CALL_GUIDE}”</div>
        {copied ? <p className="copy-ok">전화번호를 복사했어요.</p> : null}
        {telOk ? (
          <a
            className="primary-btn"
            href={telHref(phone)}
            onClick={onCall}
            style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
          >
            전화하기
          </a>
        ) : (
          <button
            type="button"
            className="primary-btn"
            onClick={async () => {
              await onCopy();
              setCopied(true);
            }}
          >
            전화번호 복사하기
          </button>
        )}
        <div style={{ height: 8 }} />
        <button type="button" className="ghost-btn" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
}
