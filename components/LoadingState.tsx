import { BackIcon } from "@/components/Icons";

export function LoadingState({ onBack }: { onBack?: () => void }) {
  return (
    <div className="page">
      {onBack ? (
        <div className="topbar" style={{ padding: "4px 8px 0 8px" }}>
          <button type="button" className="header-icon" onClick={onBack} aria-label="뒤로">
            <BackIcon />
          </button>
        </div>
      ) : null}
      <div className="loading">
        <div className="spinner" />
        <p className="sub">로딩 중입니다...</p>
      </div>
    </div>
  );
}
