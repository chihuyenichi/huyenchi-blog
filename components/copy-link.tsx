"use client";

import { useEffect } from "react";

export function CopyLinkScript() {
  useEffect(() => {
    const handler = async (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy link"; }, 1800);
    };
    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-copy-link]");
    buttons.forEach((button) => button.addEventListener("click", handler));
    return () => buttons.forEach((button) => button.removeEventListener("click", handler));
  }, []);
  return null;
}
