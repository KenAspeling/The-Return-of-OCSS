import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { AccentPicker } from "@/app/_components/accent-picker";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="absolute right-6 top-6 flex items-center gap-3">
        <AccentPicker size={12} />
        <ThemeToggle variant="compact" />
      </div>
      <div className="mb-8 flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-brand-fg)] font-bold"
          style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-soft))" }}
        >
          O
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-wide">OCSS</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dim)]">Time · Billing</span>
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Sign in to track your time.</p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--color-brand)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
