import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/format";
import { listClients } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { InvoiceBuilder } from "./_components/invoice-builder";
import { IconReceipt, IconSparkle } from "@/app/_components/icon";

const STATUS_TONE: Record<string, { fg: string; bg: string }> = {
  draft: { fg: "var(--color-violet)", bg: "color-mix(in oklch, var(--color-violet) 18%, transparent)" },
  sent: { fg: "oklch(0.85 0.13 230)", bg: "oklch(0.30 0.10 230 / 0.35)" },
  paid: { fg: "var(--color-brand)", bg: "color-mix(in oklch, var(--color-brand) 22%, transparent)" },
  void: { fg: "var(--color-dim)", bg: "color-mix(in oklch, var(--color-line) 60%, transparent)" },
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const clients = await listClients();
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
    .where(eq(schema.clients.ownerId, user.id))
    .orderBy(desc(schema.invoices.createdAt))
    .all();

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-dim)]">Invoices</span>
        <h1 className="text-4xl font-semibold tracking-tight">Bill your time</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {invoices.length === 0
            ? "Generate your first invoice from billable entries."
            : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"} · ${formatMoney(totalBilled)} billed total`}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconSparkle size={14} />}>Draft an invoice</SectionHeading>
        <InvoiceBuilder clients={clients} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconReceipt size={14} />}>Saved invoices</SectionHeading>
        {invoices.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 p-10 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[color-mix(in_oklch,var(--color-surface-2)_80%,transparent)] text-[var(--color-dim)]">∅</span>
            <div className="text-sm text-[var(--color-muted)]">No invoices yet.</div>
          </div>
        ) : (
          <ul className="surface flex flex-col divide-y divide-[color-mix(in_oklch,var(--color-line)_70%,transparent)] overflow-hidden">
            {invoices.map((i) => {
              const tone = STATUS_TONE[i.status] ?? STATUS_TONE.draft;
              return (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-[color-mix(in_oklch,var(--color-surface-2)_50%,transparent)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm font-semibold tracking-wide">{i.number}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {i.clientName}
                      {i.issuedAt && ` · issued ${new Date(i.issuedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <span
                    className="chip"
                    style={{ color: tone.fg, background: tone.bg, borderColor: `color-mix(in oklch, ${tone.fg} 40%, transparent)` }}
                  >
                    {i.status}
                  </span>
                  <div className="w-28 text-right font-mono text-base font-semibold tabular-nums">
                    {formatMoney(i.total, i.currency)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-[var(--color-brand-soft)]">{icon}</span>}
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{children}</h2>
      <div className="ml-2 flex-1">
        <hr className="hr-soft" />
      </div>
    </div>
  );
}
