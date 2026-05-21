"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { ensureSeeded } from "@/lib/db/seed";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { parseEntry } from "@/lib/parse-entry";
import { listActiveProjects } from "@/lib/queries";

function refresh() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/invoices");
}

export async function createEntryFromText(text: string) {
  ensureSeeded();
  const projects = listActiveProjects();
  const parsed = parseEntry(text, projects.map((p) => p.name));

  const project =
    projects.find((p) => p.name === parsed.projectHint) ??
    projects.find((p) => !p.billable) ??
    projects[0];
  if (!project) throw new Error("No projects available. Add one first.");

  const minutes = parsed.durationMinutes > 0 ? parsed.durationMinutes : 30;
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - minutes * 60_000);

  db.insert(schema.timeEntries)
    .values({
      id: randomUUID(),
      userId: DEFAULT_USER_ID,
      projectId: project.id,
      startedAt,
      endedAt,
      durationSeconds: minutes * 60,
      notes: parsed.notes || text,
      source: "manual",
    })
    .run();

  refresh();
  return { ok: true, project: project.name, minutes };
}

export async function createManualEntry(input: {
  projectId: string;
  durationMinutes: number;
  notes?: string;
  startedAt?: Date;
}) {
  ensureSeeded();
  const endedAt = input.startedAt
    ? new Date(input.startedAt.getTime() + input.durationMinutes * 60_000)
    : new Date();
  const startedAt = input.startedAt ?? new Date(endedAt.getTime() - input.durationMinutes * 60_000);

  db.insert(schema.timeEntries)
    .values({
      id: randomUUID(),
      userId: DEFAULT_USER_ID,
      projectId: input.projectId,
      startedAt,
      endedAt,
      durationSeconds: input.durationMinutes * 60,
      notes: input.notes ?? null,
      source: "manual",
    })
    .run();

  refresh();
}

export async function deleteEntry(id: string) {
  db.delete(schema.timeEntries)
    .where(and(eq(schema.timeEntries.id, id), eq(schema.timeEntries.userId, DEFAULT_USER_ID)))
    .run();
  refresh();
}

export async function startTimer(projectId: string, notes?: string) {
  ensureSeeded();
  // Stop anything already running first.
  await stopTimer();

  db.insert(schema.timeEntries)
    .values({
      id: randomUUID(),
      userId: DEFAULT_USER_ID,
      projectId,
      startedAt: new Date(),
      notes: notes ?? null,
      source: "timer",
    })
    .run();

  refresh();
}

export async function stopTimer() {
  const running = db
    .select()
    .from(schema.timeEntries)
    .where(
      and(eq(schema.timeEntries.userId, DEFAULT_USER_ID), isNull(schema.timeEntries.endedAt)),
    )
    .get();

  if (!running) return;

  const endedAt = new Date();
  const durationSeconds = Math.max(
    1,
    Math.floor((endedAt.getTime() - running.startedAt.getTime()) / 1000),
  );

  db.update(schema.timeEntries)
    .set({ endedAt, durationSeconds })
    .where(eq(schema.timeEntries.id, running.id))
    .run();

  refresh();
}
