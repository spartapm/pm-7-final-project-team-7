import { fetchMriNonpayItems } from "@/lib/hira";
import { loadSnapshot } from "@/lib/hospitals";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { ykiho: string } }
) {
  const ykiho = decodeURIComponent(params.ykiho || "");
  if (!ykiho) return NextResponse.json({ items: [] }, { status: 400 });

  try {
    const snapshot = await loadSnapshot();
    const stored = snapshot.hospitals.find((h) => h.ykiho === ykiho)?.mriNonpayItems ?? [];
    if (stored.length) return NextResponse.json({ items: stored, source: "snapshot" });
    const items = await fetchMriNonpayItems(ykiho);
    return NextResponse.json({ items, source: items.length ? "hira" : "empty" });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
