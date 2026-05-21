"use client";

import { useState, useTransition } from "react";
import { createClient, createProject } from "@/app/actions/projects";

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
      className="grid gap-3 rounded-lg border border-zinc-900 bg-zinc-900/40 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          let cid = clientId;
          if (!cid && newClient.trim()) {
            await createClient({ name: newClient.trim() });
            return; // page will revalidate; user picks the new client on next submit
          }
          if (!cid || !name.trim()) return;
          await createProject({
            clientId: cid,
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
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Client
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">— new client —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      {!clientId && (
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
          New client name
          <input
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Project name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Code (optional)
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Hourly rate
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          step="1"
          min="0"
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
        Billable
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
        >
          {pending ? "Saving…" : clientId ? "Add project" : "Add client"}
        </button>
      </div>
    </form>
  );
}
