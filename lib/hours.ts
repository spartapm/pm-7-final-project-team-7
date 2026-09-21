export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayHours = {
  key: DayKey;
  label: string;
  start: string | null;
  end: string | null;
  lunch: { start: string; end: string } | null;
  closed: boolean;
};

export type OpenStatus = "open" | "closed" | "ended" | "lunch";

export type HospitalHours = {
  days: DayHours[];
  hasAny: boolean;
};

const DAYS: { key: DayKey; label: string; start: string; end: string }[] = [
  { key: "mon", label: "월요일", start: "trmtMonStart", end: "trmtMonEnd" },
  { key: "tue", label: "화요일", start: "trmtTueStart", end: "trmtTueEnd" },
  { key: "wed", label: "수요일", start: "trmtWedStart", end: "trmtWedEnd" },
  { key: "thu", label: "목요일", start: "trmtThuStart", end: "trmtThuEnd" },
  { key: "fri", label: "금요일", start: "trmtFriStart", end: "trmtFriEnd" },
  { key: "sat", label: "토요일", start: "trmtSatStart", end: "trmtSatEnd" },
  { key: "sun", label: "일요일", start: "trmtSunStart", end: "trmtSunEnd" },
];

const WEEKDAY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function parseHiraTime(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const s = String(Math.trunc(value)).padStart(4, "0");
    if (!/^\d{4}$/.test(s)) return null;
    return `${s.slice(0, 2)}:${s.slice(2)}`;
  }
  const raw = String(value).replace(/\s/g, "");
  const hm = raw.match(/^(\d{1,2})시(\d{1,2})분?$/);
  if (hm) return `${hm[1].padStart(2, "0")}:${hm[2].padStart(2, "0")}`;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 3 || digits.length === 4) {
    const s = digits.padStart(4, "0");
    return `${s.slice(0, 2)}:${s.slice(2)}`;
  }
  return null;
}

export function parseHiraRange(value: unknown): { start: string; end: string } | null {
  if (value == null || value === "") return null;
  const raw = String(value);
  const parts = raw.split(/~|-/);
  if (parts.length < 2) return null;
  const start = parseHiraTime(parts[0]);
  const end = parseHiraTime(parts[1]);
  if (!start || !end) return null;
  const startH = Number(start.slice(0, 2));
  const endH = Number(end.slice(0, 2));
  if (endH < startH && endH <= 6) {
    return { start, end: `${String(endH + 12).padStart(2, "0")}${end.slice(2)}` };
  }
  return { start, end };
}

function closedFlag(value: unknown) {
  const s = String(value ?? "").replace(/\s/g, "");
  if (!s || s === "N" || s === "n" || s === "없음") return false;
  return s === "Y" || s.includes("휴진");
}

export function hoursFromHira(row: Record<string, unknown> | null | undefined): HospitalHours {
  if (!row) return { days: [], hasAny: false };
  const weekLunch = parseHiraRange(row.lunchWeek);
  const satLunch = parseHiraRange(row.lunchSat) ?? (row.lunchSat ? parseHiraRange(row.lunchWeek) : null);
  const noSun = closedFlag(row.noTrmtSun);
  const days: DayHours[] = DAYS.map((day) => {
    const start = parseHiraTime(row[day.start]);
    const end = parseHiraTime(row[day.end]);
    const forcedClosed = day.key === "sun" && noSun;
    const closed = forcedClosed || !start || !end;
    const lunch = closed ? null : day.key === "sat" ? satLunch : day.key === "sun" ? null : weekLunch;
    return { key: day.key, label: day.label, start: closed ? null : start, end: closed ? null : end, lunch, closed };
  });
  return { days, hasAny: days.some((day) => !day.closed) };
}

export function seoulParts(at = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(pick("weekday"));
  return {
    year: Number(pick("year")),
    month: Number(pick("month")),
    day: Number(pick("day")),
    hour: Number(pick("hour")),
    minute: Number(pick("minute")),
    weekday: weekday >= 0 ? weekday : 0,
  };
}

export function todayLabel(at = new Date()) {
  const p = seoulParts(at);
  return `오늘 (${p.month}. ${p.day}. ${WEEKDAY_KO[p.weekday]})`;
}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function openStatus(day: DayHours | undefined, at = new Date()): OpenStatus {
  if (!day || day.closed || !day.start || !day.end) return "closed";
  const now = seoulParts(at);
  const cur = now.hour * 60 + now.minute;
  const start = minutes(day.start);
  const end = minutes(day.end);
  if (day.lunch) {
    const ls = minutes(day.lunch.start);
    const le = minutes(day.lunch.end);
    if (cur >= ls && cur < le) return "lunch";
  }
  if (cur >= start && cur < end) return "open";
  return "ended";
}

export function statusLabel(status: OpenStatus) {
  if (status === "open") return "진료 중";
  if (status === "lunch") return "점심 시간";
  if (status === "ended") return "진료 종료";
  return "휴진";
}

export function todayHours(hours: HospitalHours, at = new Date()) {
  const key = WEEKDAY[seoulParts(at).weekday];
  return hours.days.find((day) => day.key === key) ?? null;
}
