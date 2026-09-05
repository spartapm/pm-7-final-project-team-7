import { APP_VERSION } from "./constants";
import { getSupabase } from "./supabase";

type Props = Record<string, string | number | boolean | undefined>;

function device(): "mobile" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function os(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return "ios";
  if (/Android/i.test(navigator.userAgent)) return "android";
  return "other";
}

function sessionId() {
  const key = "ieo-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function track(event: string, props: Props = {}, screen = "") {
  if (typeof window === "undefined") return;
  const payload = {
    ...props,
    screen,
    app_version: APP_VERSION,
    device: device(),
    os: os(),
  };
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) {
    gtag("event", event, payload);
  }

  const sb = getSupabase();
  if (!sb) return;
  const { screen: screenName, app_version, device: deviceName, os: osName, ...rest } = payload;
  const cleaned = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));
  void (async () => {
    const { error } = await sb.from("app_events").insert({
      session_id: sessionId(),
      event_name: event,
      screen: screenName,
      device: deviceName,
      os: osName,
      app_version,
      props: cleaned,
    });
    if (error) console.warn("[ieo] event", error.message);
  })();
}
