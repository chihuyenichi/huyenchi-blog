"use client";

import { useState } from "react";

export function StickerPhoto({ initial, pool, className }: { initial: string; pool: string[]; className?: string }) {
  const [src, setSrc] = useState(initial);

  function shuffle(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    const others = pool.filter((sticker) => sticker !== src);
    if (others.length === 0) return;
    setSrc(others[Math.floor(Math.random() * others.length)]);
  }

  return (
    <img
      src={src}
      className={className}
      alt=""
      aria-hidden="true"
      loading="lazy"
      role="button"
      tabIndex={0}
      title="Bấm để đổi sticker"
      onClick={shuffle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") shuffle(event);
      }}
    />
  );
}
