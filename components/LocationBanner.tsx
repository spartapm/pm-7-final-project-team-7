"use client";

export function LocationBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="banner">
      현재 위치를 쓰지 않아 가까운 순 대신 병원 종류 순으로 보여 드립니다.
      <br />
      <button type="button" onClick={onRetry}>
        현재 위치 사용
      </button>
    </div>
  );
}
