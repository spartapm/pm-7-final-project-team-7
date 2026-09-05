"use client";

export function LocationBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="banner">
      위치를 확인할 수 없어 거리 없이 보여 드려요.
      <br />
      <button type="button" onClick={onRetry}>
        현재 위치 사용
      </button>
    </div>
  );
}
