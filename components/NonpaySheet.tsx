"use client";

export function NonpaySheet({
  title,
  items,
  onClose,
}: {
  title: string;
  items: { name: string; note?: string }[];
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <h2>{title}</h2>
        <p className="sub" style={{ marginTop: 0 }}>
          선택한 부위 기준으로 공개된 MRI 비급여 항목입니다. 금액은 병원에 확인해 주세요.
        </p>
        <ul className="nonpay-list">
          {items.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
