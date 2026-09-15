function FigmaIcon({ src, size }: { src: string; size: number }) {
  return <img src={src} alt="" width={size} height={size} aria-hidden />;
}

export function BellIcon() {
  return <FigmaIcon src="/figma/bell.svg" size={20} />;
}

export function AvatarIcon() {
  return <FigmaIcon src="/figma/avatar.svg" size={16} />;
}

export function BackIcon() {
  return <FigmaIcon src="/figma/back.svg" size={20} />;
}

export function CalendarIcon() {
  return <FigmaIcon src="/figma/calendar.svg" size={20} />;
}

export function HiraCheckIcon() {
  return <FigmaIcon src="/figma/hira-check.svg" size={14} />;
}

export function RegionCheckIcon() {
  return <FigmaIcon src="/figma/region-check.svg" size={14} />;
}

export function CtaArrowIcon() {
  return <FigmaIcon src="/figma/cta-arrow.svg" size={16} />;
}

export function TabHomeIcon() {
  return <FigmaIcon src="/figma/tab-home.svg" size={20} />;
}

export function TabNearbyIcon() {
  return <FigmaIcon src="/figma/tab-nearby.svg" size={20} />;
}

export function PinIcon() {
  return <FigmaIcon src="/figma/pin.svg" size={16} />;
}

export function SlidersIcon() {
  return <FigmaIcon src="/figma/sliders.svg" size={12} />;
}

export function CardChevronIcon() {
  return <FigmaIcon src="/figma/card-chevron.svg" size={14} />;
}

export function ListInfoIcon() {
  return <FigmaIcon src="/figma/list-info.svg" size={16} />;
}

export function GuideChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={open ? "M4 10.2 8 6.2l4 4" : "M4 6.2 8 10.2l4-4"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.2 3.4h2.1l1.5 3.6-1.9 1.2a13.2 13.2 0 0 0 6.1 6.1l1.2-1.9 3.6 1.5v2.1c0 .8-.6 1.4-1.4 1.4C10.4 17.4 2.6 9.6 2.6 4.8c0-.8.6-1.4 1.4-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function NavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4.2 11.1 19.4 4.6l-6.5 15.2-2.1-6.6-6.6-2.1Z" fill="currentColor" />
    </svg>
  );
}

export function WarnIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2 21.8 20.2H2.2L12 3.2Zm0 6.3c-.5 0-.8.4-.8.9v3.4c0 .5.3.9.8.9s.8-.4.8-.9V10.4c0-.5-.3-.9-.8-.9Zm0 7.4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

const EXAM_ITEM_ICONS = ["/figma/exam-item-1.svg", "/figma/exam-item-2.svg", "/figma/exam-item-3.svg"] as const;

export function ExamHeadIcon() {
  return <img src="/figma/exam-head.svg" alt="" width={16} height={16} aria-hidden />;
}

export function ExamItemIcon({ index }: { index: number }) {
  const src = EXAM_ITEM_ICONS[index % EXAM_ITEM_ICONS.length];
  return <img src={src} alt="" width={16} height={16} aria-hidden />;
}

export function InfoIcon() {
  return <img src="/figma/portal-info.svg" alt="" width={16} height={16} aria-hidden />;
}
