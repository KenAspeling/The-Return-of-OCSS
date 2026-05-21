"use client";

import { useEffect, useState, useTransition } from "react";
import { startTimer, stopTimer } from "../actions/entries";
import { IconClock, IconPlay, IconStop } from "./icon";
import { colorFor } from "@/lib/color";

type Project = { id: string; name: string; clientName: string };
type Running = { id: string; projectName: string; clientName: string; startedAt: Date; notes: string | null } | null;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function splitDuration(seconds: number) {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export function Timer({ projects, running }: { projects: Project[]; running: Running }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!running) return;
    const startedAt = new Date(running.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (running) {
    const t = splitDuration(elapsed);
    const c = colorFor(running.projectName);
    return (
      <div
        className="surface glow-brand relative overflow-hidden p-6"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--color-brand) 8%, var(--color-surface)) , color-mix(in oklch, var(--color-surface) 70%, transparent))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-brand)" }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="live-dot inline-block h-2 w-2 rounded-full" style={{ background: "var(--color-brand)" }} />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-soft)]">
                Tracking
              </span>
            </div>
            <div className="flex items-center gap-2 truncate text-lg font-semibold">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.fg }} />
              <span className="truncate">{running.projectName}</span>
            </div>
            <div className="text-xs text-[var(--color-muted)]">{running.clientName}</div>
            {running.notes && <div className="mt-1 text-sm text-[var(--color-text)]/85">{running.notes}</div>}
          </div>

          <div className="flex items-baseline gap-1 font-mono text-5xl font-semibold tabular-nums tracking-tight">
            <span>{t.h}</span>
            <span className="text-[var(--color-dim)]">:</span>
            <span>{t.m}</span>
            <span className="text-[var(--color-dim)] text-3xl">:{t.s}</span>
          </div>

          <form action={() => start(async () => { await stopTimer(); })}>
            <button disabled={pending} className="btn btn-primary">
              <IconStop size={14} />
              {pending ? "Stopping…" : "Stop"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form
      className="surface relative flex flex-wrap items-center gap-3 p-5"
      action={() => start(async () => { if (projectId) await startTimer(projectId, notes || undefined); })}
    >
      <div className="flex items-center gap-2 text-[var(--color-muted)]">
        <IconClock size={18} />
        <span className="text-sm">Start a timer</span>
      </div>
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="input min-w-44"
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
        className="input min-w-48 flex-1"
      />
      <button type="submit" disabled={pending || !projectId} className="btn btn-primary">
        <IconPlay size={14} />
        {pending ? "Starting…" : "Start"}
      </button>
    </form>
  );
}
