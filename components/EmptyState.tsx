"use client";

export function EmptyState({
  onAllDaejeon,
  onOtherRegion,
}: {
  onAllDaejeon: () => void;
  onOtherRegion: () => void;
}) {
  return (
    <div className="empty">
      <h2>아직 확인된 MRI 병원이 없어요</h2>
      <p className="sub">
        이 지역에서 MRI 장비가 아직 확인되지 않은 정보입니다. 장비가 없다고 단정하지는 않습니다.
      </p>
      <PrimaryLike onClick={onAllDaejeon}>대전 전체에서 보기</PrimaryLike>
      <div style={{ height: 8 }} />
      <button type="button" className="ghost-btn" onClick={onOtherRegion}>
        다른 지역 고르기
      </button>
    </div>
  );
}

function PrimaryLike({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="primary-btn" onClick={onClick}>
      {children}
    </button>
  );
}
