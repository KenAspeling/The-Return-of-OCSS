"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { IconArrow } from "@/app/_components/icon";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="surface flex flex-col gap-4 p-5">
      <Field label="Email">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input w-full"
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input w-full"
          placeholder="••••••••"
        />
      </Field>

      {state?.error && (
        <div className="callout-danger">{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        <IconArrow size={14} />
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">{label}</span>
      {children}
    </label>
  );
}
