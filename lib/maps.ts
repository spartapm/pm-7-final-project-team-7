export function mapsUrl(opts: {
  name: string;
  addr: string;
  lat: number | null;
  lng: number | null;
}): string {
  const query = encodeURIComponent([opts.name, opts.addr].filter(Boolean).join(" ").trim());
  if (opts.lat != null && opts.lng != null) {
    return `https://map.naver.com/p/search/${query}?c=${opts.lng},${opts.lat},16,0,0,0,dh`;
  }
  return `https://map.naver.com/p/search/${query}`;
}

export function mapEmbedUrl(lat: number, lng: number) {
  const d = 0.006;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
}

export function hospitalSearchUrl(name: string) {
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(`${name} 대전 MRI`)}`;
}

export function nmapUrl(opts: {
  name: string;
  lat: number | null;
  lng: number | null;
}): string | null {
  if (opts.lat == null || opts.lng == null) return null;
  const dname = encodeURIComponent(opts.name);
  return `nmap://navigation?dlat=${opts.lat}&dlng=${opts.lng}&dname=${dname}&appname=ieo`;
}
