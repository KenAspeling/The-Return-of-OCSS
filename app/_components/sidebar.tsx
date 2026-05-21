"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { IconBriefcase, IconDashboard, IconReceipt } from "./icon";
import { ThemeToggle } from "./theme-toggle";
import { AccentPicker } from "./accent-picker";

const items = [
  { href: "/", label: "Dashboard", Icon: IconDashboard },
  { href: "/projects", label: "Projects", Icon: IconBriefcase },
  { href: "/invoices", label: "Invoices", Icon: IconReceipt },
];

type User = { name: string; email: string };

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const initials = (user.name || user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-col px-4 py-8 md:flex">
      <Link href="/" className="mb-10 flex items-center gap-2.5 px-2">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-brand-fg)] font-bold"
          style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-soft))" }}
        >
          O
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-wide">OCSS</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dim)]">Time · Billing</span>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "text-[var(--color-text)] bg-[color-mix(in_oklch,var(--color-surface-2)_70%,transparent)] border border-[color-mix(in_oklch,var(--color-line)_80%,transparent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)]",
              ].join(" ")}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full"
                  style={{ background: "var(--color-brand)" }}
                />
              )}
              <Icon className={active ? "text-[var(--color-brand)]" : ""} size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 rounded-xl border border-[color-mix(in_oklch,var(--color-line)_80%,transparent)] bg-[color-mix(in_oklch,var(--color-surface)_50%,transparent)] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dim)]">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dim)]">Accent</span>
          <AccentPicker />
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-[var(--color-brand-fg)]"
            style={{ background: "linear-gradient(135deg, var(--color-brand-soft), var(--color-violet))" }}
          >
            {initials || "?"}
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-xs font-medium">{user.name}</span>
            <span className="truncate text-[10px] text-[var(--color-dim)]">{user.email}</span>
          </div>
        </div>
        <form action={() => start(() => logoutAction())}>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md px-2 py-1.5 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)] transition-colors hover:bg-[color-mix(in_oklch,var(--color-surface-2)_70%,transparent)] hover:text-[var(--color-text)] disabled:opacity-40"
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </form>
      </div>
    </aside>
  );
}
