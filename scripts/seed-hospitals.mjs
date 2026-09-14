import fs from "node:fs";
import path from "node:path";
import { loadEnv, root } from "./load-env.mjs";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing");
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(path.join(root, "data/hospitals.json"), "utf8"));

function ternary(value) {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

const rows = snapshot.hospitals.map((h) => ({
  ykiho: h.ykiho,
  name: h.name,
  cl_cd: h.clCd,
  cl_cd_nm: h.clCdNm,
  care_level: h.careLevel,
  addr: h.addr || "",
  telno: h.telno,
  lat: h.lat,
  lng: h.lng,
  sggu_cd: h.sgguCd,
  region_id: h.regionId,
  region_label: h.regionLabel,
  mri_count: h.mriCount,
  has_mri: h.hasMri,
  has_ortho: ternary(h.hasOrtho),
  ortho_specialist_count: h.orthoSpecialistCount,
  has_mri_nonpay: ternary(h.hasMriNonpay),
  mri_nonpay_items: Array.isArray(h.mriNonpayItems) ? h.mriNonpayItems : [],
  status: h.status === "high" ? "high" : "unknown",
  evidence_id: h.evidenceId,
  evidence: h.evidence,
  source_date: h.sourceDate,
}));

async function upsert(table, body, onConflict) {
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table} ${res.status} ${text}`);
  }
}

await upsert(
  "snapshots",
  {
    id: "current",
    generated_at: snapshot.generatedAt,
    source_date: snapshot.sourceDate,
    source: snapshot.source,
    updated_at: new Date().toISOString(),
  },
  "id"
);

const chunk = 50;
for (let i = 0; i < rows.length; i += chunk) {
  await upsert("hospitals", rows.slice(i, i + chunk), "ykiho");
}

console.log(`seeded ${rows.length} hospitals`);
