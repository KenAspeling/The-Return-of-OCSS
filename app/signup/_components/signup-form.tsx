"use client";

import { useActionState } from "react";
import { signupAction, type AuthState } from "@/app/actions/auth";
import { IconSparkle } from "@/app/_components/icon";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signupAction, null);

  return (
    <form action={formAction} className="surface flex flex-col gap-4 p-5">
      <Field label="Name">
        <input name="name" required autoComplete="name" className="input w-full" placeholder="Jane Doe" />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input w-full"
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="input w-full"
          placeholder="••••••••"
        />
      </Field>

      {state?.error && (
        <div className="callout-danger">{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        <IconSparkle size={14} />
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">{label}</span>
        {hint && <span className="text-[10px] text-[var(--color-dim)]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
