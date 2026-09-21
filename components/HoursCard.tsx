"use client";

import { GuideChevronIcon } from "@/components/Icons";
import { HOURS_SHEET_NOTE } from "@/lib/constants";
import {
  openStatus,
  statusLabel,
  todayHours,
  type HospitalHours,
  todayLabel,
} from "@/lib/hours";
import { useEffect, useState } from "react";

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.8v3.3l2.1 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function HoursCard({ ykiho }: { ykiho: string }) {
  const [hours, setHours] = useState<HospitalHours | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/hospitals/${encodeURIComponent(ykiho)}/hours`)
      .then((res) => res.json())
      .then((json: { hours?: HospitalHours }) => {
        if (!cancelled) setHours(json.hours ?? { days: [], hasAny: false });
      })
      .catch(() => {
        if (!cancelled) setHours({ days: [], hasAny: false });
      });
    return () => {
      cancelled = true;
    };
  }, [ykiho]);

  const today = hours?.hasAny ? todayHours(hours) : null;
  const status = openStatus(today ?? undefined);
  const range = !hours
    ? "불러오는 중"
    : !hours.hasAny
      ? "진료시간 정보 없음"
      : today && !today.closed && today.start && today.end
        ? `${today.start} – ${today.end}`
        : "휴진";

  function toggle() {
    if (hours?.hasAny) setOpen((current) => !current);
  }

  return (
    <section className="hours-card">
      <div className="hours-card-top">
        <h2>
          <ClockIcon />
          진료시간
        </h2>
        {hours?.hasAny ? (
          <button type="button" className="hours-all" onClick={toggle} aria-expanded={open}>
            {open ? "접기" : "전체보기"}
            <GuideChevronIcon open={open} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="hours-summary"
        onClick={toggle}
        disabled={!hours?.hasAny}
        aria-expanded={hours?.hasAny ? open : undefined}
      >
        <div>
          <p className="hours-today-kicker">{hours?.hasAny ? todayLabel() : "진료시간"}</p>
          <p className={`hours-today-time${hours?.hasAny && (!today || today.closed) ? " is-closed" : ""}`}>{range}</p>
          {today?.lunch ? (
            <p className="hours-lunch">
              점심시간 {today.lunch.start} – {today.lunch.end}
            </p>
          ) : null}
        </div>
        {hours?.hasAny ? <span className={`hours-badge is-${status}`}>{statusLabel(status)}</span> : null}
      </button>
      {open && hours?.hasAny ? (
        <>
          <ul className="hours-week">
            {hours.days.map((day) => (
              <li key={day.key}>
                <span>{day.label}</span>
                <span className={day.closed ? "is-closed" : ""}>
                  {day.closed || !day.start || !day.end ? "휴진" : `${day.start} – ${day.end}`}
                </span>
                <span>{day.lunch ? `점심시간 ${day.lunch.start} – ${day.lunch.end}` : "–"}</span>
              </li>
            ))}
          </ul>
          <p className="hours-note">{HOURS_SHEET_NOTE}</p>
        </>
      ) : null}
    </section>
  );
}
