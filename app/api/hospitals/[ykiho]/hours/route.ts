import { fetchHospitalHours } from "@/lib/hira";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { ykiho: string } }
) {
  const ykiho = decodeURIComponent(params.ykiho || "");
  if (!ykiho) return NextResponse.json({ hours: { days: [], hasAny: false } }, { status: 400 });
  try {
    const hours = await fetchHospitalHours(ykiho);
    return NextResponse.json({ hours });
  } catch {
    return NextResponse.json({ hours: { days: [], hasAny: false } });
  }
}
