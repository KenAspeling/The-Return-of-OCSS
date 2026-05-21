"use client";

import { useState, useTransition } from "react";
import { previewInvoice, createInvoice, type Draft } from "@/app/actions/invoices";
import { formatMoney } from "@/lib/format";

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

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-900 bg-zinc-900/40 p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
          Client
          <select
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setDraft(null); }}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setDraft(null); }}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setDraft(null); }}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={pending || !clientId}
            onClick={() => start(async () => {
              setFeedback(null);
              const d = await previewInvoice({ clientId, from, to });
              setDraft(d);
            })}
            className="w-full rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
          >
            {pending ? "Calculating…" : "Preview"}
          </button>
        </div>
      </div>

      {draft && (
        <div className="flex flex-col gap-3">
          {draft.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-800 p-4 text-sm text-zinc-400">
              No billable entries in that range.
            </div>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-zinc-900 rounded-md border border-zinc-900 bg-zinc-950">
                {draft.items.map((i) => (
                  <li key={i.projectId} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <div className="flex-1">{i.description}</div>
                    <div className="w-24 text-right tabular-nums">{i.hours} h</div>
                    <div className="w-24 text-right text-zinc-400 tabular-nums">{formatMoney(i.unitPrice, currency)}</div>
                    <div className="w-28 text-right font-semibold tabular-nums">{formatMoney(i.amount, currency)}</div>
                  </li>
                ))}
                <li className="flex items-center gap-3 px-3 py-2 text-sm">
                  <div className="flex-1 text-right text-zinc-400">Subtotal</div>
                  <div className="w-28 text-right text-base font-semibold tabular-nums">
                    {formatMoney(draft.subtotal, currency)}
                  </div>
                </li>
              </ul>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for the client (optional)"
                className="rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm outline-none focus:border-zinc-600"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(async () => {
                    try {
                      const res = await createInvoice({ clientId, from, to, notes: notes || undefined });
                      setFeedback(`Saved ${res.number}`);
                      setDraft(null);
                      setNotes("");
                    } catch (err) {
                      setFeedback(err instanceof Error ? err.message : "Failed");
                    }
                  })}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 disabled:opacity-40"
                >
                  {pending ? "Saving…" : "Save invoice"}
                </button>
                {feedback && <span className="text-xs text-zinc-400">{feedback}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
