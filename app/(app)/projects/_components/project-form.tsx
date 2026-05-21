"use client";

import { useState, useTransition } from "react";
import { createClient, createProject } from "@/app/actions/projects";
import { IconPlus } from "@/app/_components/icon";

type Client = { id: string; name: string };

export function ProjectForm({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [newClient, setNewClient] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("");
  const [billable, setBillable] = useState(true);
  const [pending, start] = useTransition();

  return (
    <form
      className="surface grid gap-3 p-5 sm:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          if (!clientId && newClient.trim()) {
            await createClient({ name: newClient.trim() });
            return;
          }
          if (!clientId || !name.trim()) return;
          await createProject({
            clientId,
            name: name.trim(),
            code: code.trim() || undefined,
            hourlyRate: rate ? parseFloat(rate) : undefined,
            billable,
          });
          setName("");
          setCode("");
          setRate("");
        });
      }}
    >
      <Field label="Client" className="sm:col-span-2">
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input w-full">
          <option value="">— new client —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      {!clientId && (
        <Field label="New client name" className="sm:col-span-2">
          <input value={newClient} onChange={(e) => setNewClient(e.target.value)} className="input w-full" />
        </Field>
      )}
      <Field label="Project name" className="sm:col-span-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input w-full" />
      </Field>
      <Field label="Code" className="sm:col-span-1">
        <input value={code} onChange={(e) => setCode(e.target.value)} className="input w-full font-mono" />
      </Field>
      <Field label="Rate / hour" className="sm:col-span-1">
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="1" min="0" className="input w-full" />
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--color-text)] sm:col-span-2">
        <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
        <span>Billable project</span>
      </label>
      <div className="flex justify-end sm:col-span-6">
        <button type="submit" disabled={pending} className="btn btn-primary">
          <IconPlus size={14} />
          {pending ? "Saving…" : clientId ? "Add project" : "Add client"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">{label}</span>
      {children}
    </label>
  );
}
