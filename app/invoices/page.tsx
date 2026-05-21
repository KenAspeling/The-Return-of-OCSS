import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/format";
import { ensureSeeded } from "@/lib/db/seed";
import { listClients } from "@/lib/queries";
import { InvoiceBuilder } from "./_components/invoice-builder";

export default function InvoicesPage() {
  ensureSeeded();
  const clients = listClients();
  const invoices = db
    .select({
      id: schema.invoices.id,
      number: schema.invoices.number,
      status: schema.invoices.status,
      total: schema.invoices.total,
      currency: schema.invoices.currency,
      issuedAt: schema.invoices.issuedAt,
      clientName: schema.clients.name,
    })
    .from(schema.invoices)
    .innerJoin(schema.clients, eq(schema.invoices.clientId, schema.clients.id))
    .orderBy(desc(schema.invoices.createdAt))
    .all();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Invoices</span>
        <h1 className="text-3xl font-semibold">Bill your time</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Draft an invoice</h2>
        <InvoiceBuilder clients={clients} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Saved invoices</h2>
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No invoices yet.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-900 rounded-lg border border-zinc-900 bg-zinc-900/30">
            {invoices.map((i) => (
              <li key={i.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{i.number}</div>
                  <div className="text-xs text-zinc-500">{i.clientName}</div>
                </div>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-300">
                  {i.status}
                </span>
                <div className="w-28 text-right font-semibold tabular-nums">
                  {formatMoney(i.total, i.currency)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Back to dashboard
      </Link>
    </div>
  );
}
