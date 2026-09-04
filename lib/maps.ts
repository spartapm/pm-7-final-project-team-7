export function mapsUrl(opts: {
  name: string;
  addr: string;
  lat: number | null;
  lng: number | null;
}): string {
  if (opts.lat != null && opts.lng != null) {
    return `https://map.kakao.com/link/to/${encodeURIComponent(opts.name)},${opts.lat},${opts.lng}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(`${opts.name} ${opts.addr}`.trim())}`;
}

export function nmapUrl(opts: {
  name: string;
  lat: number | null;
  lng: number | null;
}): string | null {
  if (opts.lat == null || opts.lng == null) return null;
  const dname = encodeURIComponent(opts.name);
  return `nmap://route/public?dlat=${opts.lat}&dlng=${opts.lng}&dname=${dname}&appname=ieo.vercel.app`;
}
