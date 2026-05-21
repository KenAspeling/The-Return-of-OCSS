import type { ComponentType } from "react";
import type { IconProps } from "./icon-types";

export function StatCard({
  label,
  value,
  sub,
  Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: ComponentType<IconProps>;
  tone?: "neutral" | "brand" | "violet";
}) {
  const stripe =
    tone === "brand"
      ? "var(--color-brand)"
      : tone === "violet"
        ? "var(--color-violet)"
        : "color-mix(in oklch, var(--color-line) 80%, transparent)";

  return (
    <div className="surface relative overflow-hidden p-5">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${stripe}, transparent)` }}
      />
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
        <span>{label}</span>
        <Icon className="text-[var(--color-muted)]" size={16} />
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--color-muted)]">{sub}</div>}
    </div>
  );
}
