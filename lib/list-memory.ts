import { LIST_FOCUS_KEY, LIST_SCROLL_KEY } from "./constants";

export function rememberListHospital(ykiho: string) {
  try {
    sessionStorage.setItem(LIST_FOCUS_KEY, ykiho);
  } catch {
    /* ignore */
  }
}

export function readListHospital() {
  try {
    return sessionStorage.getItem(LIST_FOCUS_KEY);
  } catch {
    return null;
  }
}

export function forgetListHospital() {
  try {
    sessionStorage.removeItem(LIST_FOCUS_KEY);
    sessionStorage.removeItem(LIST_SCROLL_KEY);
  } catch {
    /* ignore */
  }
}

export function scrollListHospitalIntoView(ykiho: string) {
  const el = document.querySelector(`[data-ykiho="${CSS.escape(ykiho)}"]`);
  if (!(el instanceof HTMLElement)) return false;
  const shell = document.querySelector(".app-shell");
  if (shell instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top - shell.getBoundingClientRect().top + shell.scrollTop;
    const max = Math.max(0, shell.scrollHeight - shell.clientHeight);
    const next = Math.min(max, Math.max(0, top - shell.clientHeight / 2 + el.clientHeight / 2));
    shell.scrollTop = next;
    return true;
  }
  el.scrollIntoView({ block: "center", inline: "nearest" });
  return true;
}

export function isListHospitalInView(ykiho: string) {
  const el = document.querySelector(`[data-ykiho="${CSS.escape(ykiho)}"]`);
  const shell = document.querySelector(".app-shell");
  if (!(el instanceof HTMLElement) || !(shell instanceof HTMLElement)) return false;
  const card = el.getBoundingClientRect();
  const frame = shell.getBoundingClientRect();
  return card.bottom > frame.top + 80 && card.top < frame.bottom - 40;
}
