export function splitHospitalAddr(addr: string): { line1: string; line2: string | null } {
  const raw = addr.replace(/\s+/g, " ").trim();
  if (!raw) return { line1: "", line2: null };
  const dong = raw.match(/\(([^)]+동)\)/)?.[1] ?? null;
  let rest = raw
    .replace(/\s*\([^)]+동\)\s*/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/,(?:\s*,)+/g, ",")
    .trim()
    .replace(/^,|,$/g, "")
    .trim();
  const comma = rest.indexOf(",");
  let street = rest;
  let extra = "";
  if (comma >= 0) {
    street = rest.slice(0, comma).trim();
    extra = rest.slice(comma + 1).trim().replace(/^,\s*/, "");
  }
  const line1 = dong ? `${street} (${dong})` : street;
  return { line1, line2: extra || null };
}
