"use client";

import { useTransition } from "react";
import { deleteEntry } from "../actions/entries";
import { formatDuration, formatTime } from "@/lib/format";
import { colorFor } from "@/lib/color";
import { IconTrash } from "./icon";

type Entry = {
  id: string;
  projectName: string;
  clientName: string;
  taskName: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  notes: string | null;
  source: string;
};

export function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-2 p-10 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[color-mix(in_oklch,var(--color-surface-2)_80%,transparent)] text-[var(--color-dim)]">
          ∅
        </span>
        <div className="text-sm text-[var(--color-muted)]">Nothing logged today yet.</div>
        <div className="text-xs text-[var(--color-dim)]">Start a timer or paste a quick entry above.</div>
      </div>
    );
  }
  return (
    <ul className="surface flex flex-col divide-y divide-[color-mix(in_oklch,var(--color-line)_70%,transparent)] overflow-hidden">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </ul>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const [pending, start] = useTransition();
  const dur = entry.durationSeconds ?? Math.floor((Date.now() - new Date(entry.startedAt).getTime()) / 1000);
  const running = entry.endedAt == null;
  const c = colorFor(entry.projectName);

  return (
    <li className="group flex flex-wrap items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-[color-mix(in_oklch,var(--color-surface-2)_50%,transparent)]">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: c.fg, boxShadow: `0 0 0 3px color-mix(in oklch, ${c.fg} 18%, transparent)` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate font-medium">
          {entry.projectName}
          {running && (
            <span className="chip" style={{ color: "var(--color-brand)", borderColor: "color-mix(in oklch, var(--color-brand) 40%, transparent)" }}>
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-brand)" }} />
              live
            </span>
          )}
        </div>
        <div className="truncate text-xs text-[var(--color-muted)]">
          {entry.clientName}
          {entry.notes && <> · {entry.notes}</>}
        </div>
      </div>
      <div className="hidden font-mono text-xs text-[var(--color-dim)] tabular-nums sm:block">
        {formatTime(new Date(entry.startedAt))}
        {entry.endedAt && ` – ${formatTime(new Date(entry.endedAt))}`}
      </div>
      <div className="w-20 text-right font-mono text-base font-semibold tabular-nums">
        {formatDuration(dur)}
      </div>
      {!running && (
        <button
          onClick={() => start(async () => { await deleteEntry(entry.id); })}
          disabled={pending}
          className="text-[var(--color-dim)] opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 disabled:opacity-40"
          aria-label="Delete entry"
        >
          <IconTrash size={14} />
        </button>
      )}
    </li>
  );
}
