"use client";

export function ErrorState({
  onRetry,
  onOtherRegion,
}: {
  onRetry: () => void;
  onOtherRegion: () => void;
}) {
  return (
    <div className="error">
      <h2>병원 정보를 불러오지 못했어요</h2>
      <p className="sub">잠시 후 다시 시도해 주세요.</p>
      <button type="button" className="primary-btn" onClick={onRetry}>
        다시 시도
      </button>
      <div style={{ height: 8 }} />
      <button type="button" className="ghost-btn" onClick={onOtherRegion}>
        다른 지역 고르기
      </button>
    </div>
  );
}
