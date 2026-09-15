"use client";

import { useEffect } from "react";

export function useLockAppScroll({ lockTouch = false }: { lockTouch?: boolean } = {}) {
  useEffect(() => {
    const shell = document.querySelector(".app-shell");
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const saved = shell instanceof HTMLElement ? shell.scrollTop : 0;
    const freeze = () => {
      if (shell instanceof HTMLElement && shell.scrollTop !== saved) shell.scrollTop = saved;
    };
    const blockTouch = (event: TouchEvent) => {
      event.preventDefault();
    };
    if (shell instanceof HTMLElement) {
      shell.classList.add("is-modal-locked");
      shell.addEventListener("scroll", freeze);
    }
    if (lockTouch) document.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      if (lockTouch) document.removeEventListener("touchmove", blockTouch);
      if (shell instanceof HTMLElement) {
        shell.classList.remove("is-modal-locked");
        shell.removeEventListener("scroll", freeze);
        shell.scrollTop = saved;
      }
    };
  }, [lockTouch]);
}
