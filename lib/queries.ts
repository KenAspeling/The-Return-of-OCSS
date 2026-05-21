import { and, asc, desc, eq, gte, isNull, lt } from "drizzle-orm";
import { db, schema } from "./db";
import { requireUser } from "./auth";

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function listProjects() {
  const user = await requireUser();
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
    .where(eq(schema.clients.ownerId, user.id))
    .orderBy(asc(schema.clients.name), asc(schema.projects.name))
    .all();
}

export async function listActiveProjects() {
  const all = await listProjects();
  return all.filter((p) => p.archivedAt == null);
}

export async function listClients() {
  const user = await requireUser();
  return db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.ownerId, user.id))
    .orderBy(asc(schema.clients.name))
    .all();
}

export async function listEntriesSince(since: Date) {
  const user = await requireUser();
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
    .where(and(eq(schema.timeEntries.userId, user.id), gte(schema.timeEntries.startedAt, since)))
    .orderBy(desc(schema.timeEntries.startedAt))
    .all();
}

export async function listEntriesBetween(from: Date, to: Date, clientId?: string) {
  const user = await requireUser();
  const where = and(
    eq(schema.timeEntries.userId, user.id),
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

export async function getRunningEntry() {
  const user = await requireUser();
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
    .where(and(eq(schema.timeEntries.userId, user.id), isNull(schema.timeEntries.endedAt)))
    .get();
}

export async function todayTotals() {
  const entries = await listEntriesSince(startOfToday());
  let totalSeconds = 0;
  let billableSeconds = 0;
  for (const e of entries) {
    const dur = e.durationSeconds ?? Math.floor((Date.now() - e.startedAt.getTime()) / 1000);
    totalSeconds += dur;
    billableSeconds += dur;
  }
  return { totalSeconds, billableSeconds, count: entries.length };
}

export async function weekTotal() {
  const user = await requireUser();
  const d = startOfToday();
  d.setDate(d.getDate() - d.getDay());
  const rows = db
    .select({ duration: schema.timeEntries.durationSeconds, started: schema.timeEntries.startedAt })
    .from(schema.timeEntries)
    .where(and(eq(schema.timeEntries.userId, user.id), gte(schema.timeEntries.startedAt, d)))
    .all();
  let total = 0;
  for (const r of rows) {
    total += r.duration ?? Math.floor((Date.now() - r.started.getTime()) / 1000);
  }
  return total;
}
