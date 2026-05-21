"use client";

import { useState, useTransition } from "react";
import { previewInvoice, createInvoice, type Draft } from "@/app/actions/invoices";
import { formatMoney } from "@/lib/format";
import { colorFor } from "@/lib/color";
import { IconArrow, IconSparkle } from "@/app/_components/icon";

type Client = { id: string; name: string; currency: string };

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function InvoiceBuilder({ clients }: { clients: Client[] }) {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [from, setFrom] = useState(isoDay(monthAgo));
  const [to, setTo] = useState(isoDay(today));
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const currency = clients.find((c) => c.id === clientId)?.currency ?? "USD";
  const totalHours = draft?.items.reduce((s, i) => s + i.hours, 0) ?? 0;

  return (
    <div className="surface flex flex-col gap-5 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Client">
          <select
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setDraft(null); }}
            className="input w-full"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setDraft(null); }}
            className="input w-full"
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setDraft(null); }}
            className="input w-full"
          />
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            disabled={pending || !clientId}
            onClick={() => start(async () => {
              setFeedback(null);
              const d = await previewInvoice({ clientId, from, to });
              setDraft(d);
            })}
            className="btn btn-ghost w-full"
          >
            <IconSparkle size={14} />
            {pending ? "Calculating…" : "Preview"}
          </button>
        </div>
      </div>

      {draft && (
        <div className="flex flex-col gap-4">
          {draft.items.length === 0 ? (
            <div className="surface-strong p-5 text-center text-sm text-[var(--color-muted)]">
              No billable entries in that range.
            </div>
          ) : (
            <>
              <div className="surface-strong overflow-hidden">
                <div className="grid grid-cols-[1fr_5rem_6rem_7rem] gap-3 border-b border-[color-mix(in_oklch,var(--color-line)_70%,transparent)] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
                  <span>Project</span>
                  <span className="text-right">Hours</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                <ul className="divide-y divide-[color-mix(in_oklch,var(--color-line)_60%,transparent)]">
                  {draft.items.map((i) => {
                    const c = colorFor(i.description);
                    return (
                      <li key={i.projectId} className="grid grid-cols-[1fr_5rem_6rem_7rem] items-center gap-3 px-4 py-2.5 text-sm">
                        <span className="flex items-center gap-2 truncate">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.fg }} />
                          {i.description}
                        </span>
                        <span className="text-right font-mono tabular-nums">{i.hours.toFixed(2)} h</span>
                        <span className="text-right font-mono tabular-nums text-[var(--color-muted)]">{formatMoney(i.unitPrice, currency)}</span>
                        <span className="text-right font-mono font-semibold tabular-nums">{formatMoney(i.amount, currency)}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="grid grid-cols-[1fr_5rem_6rem_7rem] items-center gap-3 border-t border-[color-mix(in_oklch,var(--color-line)_80%,transparent)] bg-[color-mix(in_oklch,var(--color-surface-2)_60%,transparent)] px-4 py-3 text-sm">
                  <span className="text-right text-[var(--color-muted)]">Subtotal</span>
                  <span className="text-right font-mono text-[var(--color-muted)] tabular-nums">{totalHours.toFixed(2)} h</span>
                  <span />
                  <span className="text-right font-mono text-lg font-semibold tabular-nums">{formatMoney(draft.subtotal, currency)}</span>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for the client (optional)"
                className="input min-h-20 w-full resize-none"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(async () => {
                    try {
                      const res = await createInvoice({ clientId, from, to, notes: notes || undefined });
                      setFeedback(`✓ Saved ${res.number}`);
                      setDraft(null);
                      setNotes("");
                    } catch (err) {
                      setFeedback(err instanceof Error ? err.message : "Failed");
                    }
                  })}
                  className="btn btn-primary"
                >
                  <IconArrow size={14} />
                  {pending ? "Saving…" : "Save invoice"}
                </button>
                {feedback && <span className="text-xs text-[var(--color-muted)]">{feedback}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">{label}</span>
      {children}
    </label>
  );
}
