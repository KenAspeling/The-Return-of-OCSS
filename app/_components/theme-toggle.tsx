"use client";

import { useEffect, useState } from "react";
import { IconMonitor, IconMoon, IconSun } from "./icon";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "ocss-theme";

function resolve(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme;
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = resolve(theme);
}

const OPTIONS: { value: Theme; label: string; Icon: typeof IconSun }[] = [
  { value: "light", label: "Light", Icon: IconSun },
  { value: "system", label: "System", Icon: IconMonitor },
  { value: "dark", label: "Dark", Icon: IconMoon },
];

export function ThemeToggle({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const set = (t: Theme) => {
    setTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
    apply(t);
  };

  // Don't render the active state until mounted to avoid hydration mismatch.
  const active = mounted ? theme : null;

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={[
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        "border-[color-mix(in_oklch,var(--color-line)_80%,transparent)]",
        "bg-[color-mix(in_oklch,var(--color-surface)_50%,transparent)]",
      ].join(" ")}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => set(value)}
            className={[
              "inline-flex items-center justify-center rounded-full transition-colors",
              variant === "compact" ? "h-6 w-6" : "h-7 w-7",
              isActive
                ? "bg-[var(--color-brand)] text-[var(--color-brand-fg)]"
                : "text-[var(--color-dim)] hover:text-[var(--color-text)]",
            ].join(" ")}
          >
            <Icon size={variant === "compact" ? 12 : 14} />
          </button>
        );
      })}
    </div>
  );
}
