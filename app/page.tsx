import { listActiveProjects, listEntriesSince, getRunningEntry, startOfToday, todayTotals, weekTotal } from "@/lib/queries";
import { formatDuration, formatHours } from "@/lib/format";
import { QuickEntry } from "./_components/quick-entry";
import { Timer } from "./_components/timer";
import { EntryList } from "./_components/entry-list";

export default function Home() {
  const projects = listActiveProjects();
  const running = getRunningEntry();
  const entries = listEntriesSince(startOfToday());
  const today = todayTotals();
  const week = weekTotal();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Dashboard</span>
        <h1 className="text-3xl font-semibold">Today</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Today" value={formatDuration(today.totalSeconds)} sub={`${formatHours(today.totalSeconds)} h`} />
        <Stat label="This week" value={formatDuration(week)} sub={`${formatHours(week)} h`} />
        <Stat label="Entries today" value={today.count.toString()} sub="" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Timer</h2>
        <Timer projects={projects} running={running ?? null} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Quick entry</h2>
        <QuickEntry />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Today's entries</h2>
        <EntryList entries={entries} />
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
