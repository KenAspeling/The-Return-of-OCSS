import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCSS",
  description: "Time tracking and invoicing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl">
          <aside className="hidden w-56 flex-col border-r border-zinc-900 px-4 py-8 md:flex">
            <Link href="/" className="mb-8 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500 text-sm font-bold text-zinc-950">
                O
              </span>
              <span className="text-sm font-semibold tracking-wide">OCSS</span>
            </Link>
            <nav className="flex flex-col gap-1 text-sm">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/projects">Projects</NavLink>
              <NavLink href="/invoices">Invoices</NavLink>
            </nav>
          </aside>
          <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
    >
      {children}
    </Link>
  );
}
