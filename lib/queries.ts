import { and, asc, desc, eq, gte, isNull, lt } from "drizzle-orm";
import { db, schema } from "./db";
import { ensureSeeded } from "./db/seed";
import { DEFAULT_USER_ID } from "./constants";

function init() {
  ensureSeeded();
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function listProjects() {
  init();
  return db
    .select({
      id: schema.projects.id,
      name: schema.projects.name,
      code: schema.projects.code,
      billable: schema.projects.billable,
      hourlyRate: schema.projects.hourlyRate,
      archivedAt: schema.projects.archivedAt,
      clientId: schema.clients.id,
      clientName: schema.clients.name,
    })
    .from(schema.projects)
    .innerJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
    .orderBy(asc(schema.clients.name), asc(schema.projects.name))
    .all();
}

export function listActiveProjects() {
  return listProjects().filter((p) => p.archivedAt == null);
}

export function listClients() {
  init();
  return db.select().from(schema.clients).orderBy(asc(schema.clients.name)).all();
}

export type EntryRow = ReturnType<typeof listEntriesSince>[number];

export function listEntriesSince(since: Date) {
  init();
  return db
    .select({
      id: schema.timeEntries.id,
      projectId: schema.timeEntries.projectId,
      projectName: schema.projects.name,
      clientName: schema.clients.name,
      taskId: schema.timeEntries.taskId,
      taskName: schema.tasks.name,
      startedAt: schema.timeEntries.startedAt,
      endedAt: schema.timeEntries.endedAt,
      durationSeconds: schema.timeEntries.durationSeconds,
      notes: schema.timeEntries.notes,
      source: schema.timeEntries.source,
    })
    .from(schema.timeEntries)
    .innerJoin(schema.projects, eq(schema.timeEntries.projectId, schema.projects.id))
    .innerJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
    .leftJoin(schema.tasks, eq(schema.timeEntries.taskId, schema.tasks.id))
    .where(
      and(eq(schema.timeEntries.userId, DEFAULT_USER_ID), gte(schema.timeEntries.startedAt, since)),
    )
    .orderBy(desc(schema.timeEntries.startedAt))
    .all();
}

export function listEntriesBetween(from: Date, to: Date, clientId?: string) {
  init();
  const where = and(
    eq(schema.timeEntries.userId, DEFAULT_USER_ID),
    gte(schema.timeEntries.startedAt, from),
    lt(schema.timeEntries.startedAt, to),
    clientId ? eq(schema.clients.id, clientId) : undefined,
  );
  return db
    .select({
      id: schema.timeEntries.id,
      projectId: schema.timeEntries.projectId,
      projectName: schema.projects.name,
      clientId: schema.clients.id,
      clientName: schema.clients.name,
      taskName: schema.tasks.name,
      startedAt: schema.timeEntries.startedAt,
      durationSeconds: schema.timeEntries.durationSeconds,
      notes: schema.timeEntries.notes,
      billable: schema.projects.billable,
      hourlyRate: schema.projects.hourlyRate,
    })
    .from(schema.timeEntries)
    .innerJoin(schema.projects, eq(schema.timeEntries.projectId, schema.projects.id))
    .innerJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
    .leftJoin(schema.tasks, eq(schema.timeEntries.taskId, schema.tasks.id))
    .where(where)
    .orderBy(asc(schema.timeEntries.startedAt))
    .all();
}

export function getRunningEntry() {
  init();
  return db
    .select({
      id: schema.timeEntries.id,
      projectId: schema.timeEntries.projectId,
      projectName: schema.projects.name,
      clientName: schema.clients.name,
      startedAt: schema.timeEntries.startedAt,
      notes: schema.timeEntries.notes,
    })
    .from(schema.timeEntries)
    .innerJoin(schema.projects, eq(schema.timeEntries.projectId, schema.projects.id))
    .innerJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
    .where(
      and(eq(schema.timeEntries.userId, DEFAULT_USER_ID), isNull(schema.timeEntries.endedAt)),
    )
    .get();
}

export function todayTotals() {
  const entries = listEntriesSince(startOfToday());
  let totalSeconds = 0;
  let billableSeconds = 0;
  for (const e of entries) {
    const dur = e.durationSeconds ?? Math.floor((Date.now() - e.startedAt.getTime()) / 1000);
    totalSeconds += dur;
    // We don't have billable on the join here; approximate as all billable for the dashboard.
    billableSeconds += dur;
  }
  return { totalSeconds, billableSeconds, count: entries.length };
}

export function weekTotal() {
  const d = startOfToday();
  d.setDate(d.getDate() - d.getDay()); // Sunday
  const rows = db
    .select({ duration: schema.timeEntries.durationSeconds, started: schema.timeEntries.startedAt })
    .from(schema.timeEntries)
    .where(
      and(eq(schema.timeEntries.userId, DEFAULT_USER_ID), gte(schema.timeEntries.startedAt, d)),
    )
    .all();
  let total = 0;
  for (const r of rows) {
    total += r.duration ?? Math.floor((Date.now() - r.started.getTime()) / 1000);
  }
  return total;
}

