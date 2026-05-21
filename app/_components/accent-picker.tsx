"use client";

import { useEffect, useState } from "react";

export const ACCENTS = [
  { id: "mint",    name: "Mint",    hue: 155, chroma: 0.18 },
  { id: "sky",     name: "Sky",     hue: 230, chroma: 0.16 },
  { id: "violet",  name: "Violet",  hue: 290, chroma: 0.20 },
  { id: "pink",    name: "Pink",    hue: 340, chroma: 0.18 },
  { id: "amber",   name: "Amber",   hue: 70,  chroma: 0.16 },
  { id: "crimson", name: "Crimson", hue: 20,  chroma: 0.18 },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export const STORAGE_KEY = "ocss-accent";

function apply(id: AccentId) {
  document.documentElement.dataset.accent = id;
}

export function AccentPicker({ size = 14 }: { size?: number }) {
  const [accent, setAccent] = useState<AccentId>("mint");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AccentId | null;
    const initial = saved && ACCENTS.some((a) => a.id === saved) ? saved : "mint";
    setAccent(initial);
    setMounted(true);
  }, []);

  const set = (id: AccentId) => {
    setAccent(id);
    localStorage.setItem(STORAGE_KEY, id);
    apply(id);
  };

  return (
    <div role="radiogroup" aria-label="Accent color" className="inline-flex items-center gap-1.5">
      {ACCENTS.map((a) => {
        const isActive = mounted && accent === a.id;
        const swatch = `oklch(0.72 ${a.chroma} ${a.hue})`;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={a.name}
            title={a.name}
            onClick={() => set(a.id)}
            className={[
              "relative rounded-full transition-transform",
              "ring-offset-2 ring-offset-[var(--color-bg)]",
              isActive ? "ring-2 ring-[var(--color-text)]" : "hover:scale-110",
            ].join(" ")}
            style={{
              width: size,
              height: size,
              background: swatch,
            }}
          />
        );
      })}
    </div>
  );
}
