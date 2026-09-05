"use client";

export function EmptyState({
  regionName,
  onAllDaejeon,
  onOtherRegion,
}: {
  regionName: string;
  onAllDaejeon: () => void;
  onOtherRegion: () => void;
}) {
  return (
    <div className="empty">
      <h2>{regionName}에서는 확인되지 않았어요</h2>
      <p className="sub">해당 병원이 없다는 뜻이 아니라, MRI 장비가 아직 확인되지 않은 정보입니다.</p>
      <button type="button" className="primary-btn" onClick={onAllDaejeon}>
        대전 전체에서 찾기
      </button>
      <div style={{ height: 8 }} />
      <button type="button" className="ghost-btn" onClick={onOtherRegion}>
        다른 지역 고르기
      </button>
    </div>
  );
}
