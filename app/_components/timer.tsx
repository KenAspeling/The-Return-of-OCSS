"use client";

import { useEffect, useState, useTransition } from "react";
import { startTimer, stopTimer } from "../actions/entries";
import { formatDuration } from "@/lib/format";

type Project = { id: string; name: string; clientName: string };
type Running = { id: string; projectName: string; clientName: string; startedAt: Date; notes: string | null } | null;

export function Timer({ projects, running }: { projects: Project[]; running: Running }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!running) return;
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(running.startedAt).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (running) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-4">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-emerald-400">Running</div>
          <div className="font-medium">{running.projectName}</div>
          <div className="text-xs text-zinc-400">{running.clientName}</div>
          {running.notes && <div className="mt-1 text-sm text-zinc-300">{running.notes}</div>}
        </div>
        <div className="text-3xl font-semibold tabular-nums text-emerald-300">{formatDuration(elapsed)}</div>
        <form action={() => start(async () => { await stopTimer(); })}>
          <button
            disabled={pending}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 disabled:opacity-40"
          >
            {pending ? "Stopping…" : "Stop"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900/40 p-4"
      action={() => start(async () => { if (projectId) await startTimer(projectId, notes || undefined); })}
    >
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
      >
        {projects.length === 0 && <option value="">No projects yet</option>}
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.clientName} — {p.name}
          </option>
        ))}
      </select>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What are you working on?"
        className="min-w-48 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
      />
      <button
        type="submit"
        disabled={pending || !projectId}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 disabled:opacity-40"
      >
        {pending ? "Starting…" : "Start"}
      </button>
    </form>
  );
}
