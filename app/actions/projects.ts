"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createProject(input: {
  clientId: string;
  name: string;
  code?: string;
  hourlyRate?: number;
  billable: boolean;
}) {
  const user = await requireUser();
  const owned = db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(and(eq(schema.clients.id, input.clientId), eq(schema.clients.ownerId, user.id)))
    .get();
  if (!owned) throw new Error("Client not found.");

  db.insert(schema.projects)
    .values({
      id: randomUUID(),
      clientId: input.clientId,
      name: input.name,
      code: input.code || null,
      hourlyRate: input.hourlyRate ?? null,
      billable: input.billable,
    })
    .run();
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function createClient(input: { name: string; currency?: string }) {
  const user = await requireUser();
  db.insert(schema.clients)
    .values({
      id: randomUUID(),
      ownerId: user.id,
      name: input.name,
      currency: input.currency ?? "USD",
    })
    .run();
  revalidatePath("/projects");
}

export async function toggleArchiveProject(id: string) {
  const user = await requireUser();
  const row = db
    .select({ archivedAt: schema.projects.archivedAt, ownerId: schema.clients.ownerId })
    .from(schema.projects)
    .innerJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
    .where(eq(schema.projects.id, id))
    .get();
  if (!row || row.ownerId !== user.id) throw new Error("Project not found.");

  db.update(schema.projects)
    .set({ archivedAt: row.archivedAt ? null : new Date() })
    .where(eq(schema.projects.id, id))
    .run();
  revalidatePath("/projects");
  revalidatePath("/");
}
