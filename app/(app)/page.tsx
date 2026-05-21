import { listActiveProjects, listEntriesSince, getRunningEntry, startOfToday, todayTotals, weekTotal } from "@/lib/queries";
import { formatDuration, formatHours } from "@/lib/format";
import { QuickEntry } from "@/app/_components/quick-entry";
import { Timer } from "@/app/_components/timer";
import { EntryList } from "@/app/_components/entry-list";
import { StatCard } from "@/app/_components/stat-card";
import { IconBolt, IconCalendar, IconClock, IconHash } from "@/app/_components/icon";
import { requireUser } from "@/lib/auth";

export default async function Home() {
  const user = await requireUser();
  const [projects, running, entries, today, week] = await Promise.all([
    listActiveProjects(),
    getRunningEntry(),
    listEntriesSince(startOfToday()),
    todayTotals(),
    weekTotal(),
  ]);

  const greeting = greet(user.name.split(" ")[0]);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-dim)]">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">{greeting}.</h1>
        <p className="text-sm text-[var(--color-muted)]">Here's your day so far.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={formatDuration(today.totalSeconds)} sub={`${formatHours(today.totalSeconds)} hours billed`} Icon={IconClock} tone="brand" />
        <StatCard label="This week" value={formatDuration(week)} sub={`${formatHours(week)} hours total`} Icon={IconCalendar} />
        <StatCard label="Entries today" value={today.count.toString()} sub={today.count === 0 ? "Get started below" : "tracked logs"} Icon={IconHash} tone="violet" />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconClock size={14} />}>Timer</SectionHeading>
        <Timer projects={projects} running={running ?? null} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconBolt size={14} />}>Quick entry</SectionHeading>
        <QuickEntry projectNames={projects.map((p) => p.name)} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Today's entries</SectionHeading>
        <EntryList entries={entries} />
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

function greet(firstName: string) {
  const h = new Date().getHours();
  const name = firstName ? `, ${firstName}` : "";
  if (h < 5) return `Burning the midnight oil${name}`;
  if (h < 12) return `Good morning${name}`;
  if (h < 17) return `Good afternoon${name}`;
  if (h < 22) return `Good evening${name}`;
  return `Still up${name}`;
}
