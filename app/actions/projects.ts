"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { ensureSeeded } from "@/lib/db/seed";

export async function createProject(input: {
  clientId: string;
  name: string;
  code?: string;
  hourlyRate?: number;
  billable: boolean;
}) {
  ensureSeeded();
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
  ensureSeeded();
  db.insert(schema.clients)
    .values({
      id: randomUUID(),
      ownerId: "default-user",
      name: input.name,
      currency: input.currency ?? "USD",
    })
    .run();
  revalidatePath("/projects");
}

export async function toggleArchiveProject(id: string) {
  const row = db
    .select({ archivedAt: schema.projects.archivedAt })
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .get();
  db.update(schema.projects)
    .set({ archivedAt: row?.archivedAt ? null : new Date() })
    .where(eq(schema.projects.id, id))
    .run();
  revalidatePath("/projects");
  revalidatePath("/");
}
