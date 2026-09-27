"use client";

import { useState } from "react";

export function CopyCodeButton() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const code = document.querySelector<HTMLElement>("[data-source-code] code")?.innerText;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className="resource-action" onClick={copyCode}>
      {copied ? "Đã sao chép ✓" : "Sao chép code"}
    </button>
  );
}
