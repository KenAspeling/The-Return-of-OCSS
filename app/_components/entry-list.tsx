"use client";

import { useTransition } from "react";
import { deleteEntry } from "../actions/entries";
import { formatDuration, formatTime } from "@/lib/format";

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
      <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
        Nothing logged today yet.
      </div>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-zinc-900 rounded-lg border border-zinc-900 bg-zinc-900/30">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </ul>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const [pending, start] = useTransition();
  const dur = entry.durationSeconds ?? Math.floor((Date.now() - entry.startedAt.getTime()) / 1000);
  const running = entry.endedAt == null;
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
      <div className="flex-1">
        <div className="font-medium">
          {entry.projectName}
          <span className="ml-2 text-xs text-zinc-500">{entry.clientName}</span>
        </div>
        {entry.notes && <div className="text-xs text-zinc-400">{entry.notes}</div>}
      </div>
      <div className="text-xs text-zinc-500 tabular-nums">
        {formatTime(entry.startedAt)}
        {entry.endedAt && ` – ${formatTime(entry.endedAt)}`}
      </div>
      <div className="w-20 text-right text-base font-semibold tabular-nums">
        {formatDuration(dur)}
      </div>
      {!running && (
        <button
          onClick={() => start(async () => { await deleteEntry(entry.id); })}
          disabled={pending}
          className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-40"
          aria-label="Delete entry"
        >
          ✕
        </button>
      )}
    </li>
  );
}
