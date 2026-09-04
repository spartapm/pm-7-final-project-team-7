import { APP_VERSION } from "./constants";

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
}
