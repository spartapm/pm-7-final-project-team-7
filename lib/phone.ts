export function phoneDigits(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[^0-9]/g, "");
}

export function formatPhone(raw: string | null | undefined): string | null {
  const digits = phoneDigits(raw);
  if (digits.length < 9 || digits.length > 11) return null;
  if (digits.startsWith("02")) {
    if (digits.length === 9) return `02-${digits.slice(2, 5)}-${digits.slice(5)}`;
    if (digits.length === 10) return `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return null;
}

export function normalizePhone(raw: string | null | undefined): string | null {
  return formatPhone(raw);
}

export function hasPhoneNumber(raw: string | null | undefined): boolean {
  return phoneDigits(raw).length >= 8;
}

export function displayPhone(raw: string | null | undefined): string | null {
  if (!hasPhoneNumber(raw)) return null;
  const original = (raw ?? "").trim();
  if (/[-\s]/.test(original)) return original;
  return formatPhone(raw) ?? original;
}

export function telHref(raw: string): string {
  return `tel:${phoneDigits(raw)}`;
}

export function canUseTel(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function canDial(raw: string | null | undefined): boolean {
  return hasPhoneNumber(raw) && canUseTel();
}
