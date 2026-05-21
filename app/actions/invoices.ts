"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { listEntriesBetween } from "@/lib/queries";

export type DraftItem = {
  projectId: string;
  description: string;
  hours: number;
  unitPrice: number;
  amount: number;
};

export type Draft = {
  items: DraftItem[];
  subtotal: number;
};

export async function previewInvoice(input: {
  clientId: string;
  from: string;
  to: string;
}): Promise<Draft> {
  const from = new Date(input.from);
  const to = new Date(input.to);
  to.setDate(to.getDate() + 1);

  const entries = (await listEntriesBetween(from, to, input.clientId)).filter((e) => e.billable);

  const grouped = new Map<string, DraftItem>();
  for (const e of entries) {
    const hours = (e.durationSeconds ?? 0) / 3600;
    const unit = e.hourlyRate ?? 0;
    const existing = grouped.get(e.projectId);
    if (existing) {
      existing.hours += hours;
      existing.amount = round2(existing.hours * existing.unitPrice);
    } else {
      grouped.set(e.projectId, {
        projectId: e.projectId,
        description: e.projectName,
        hours: round2(hours),
        unitPrice: unit,
        amount: round2(hours * unit),
      });
    }
  }

  const items = [...grouped.values()].map((i) => ({ ...i, hours: round2(i.hours) }));
  const subtotal = round2(items.reduce((s, i) => s + i.amount, 0));
  return { items, subtotal };
}

export async function createInvoice(input: {
  clientId: string;
  from: string;
  to: string;
  notes?: string;
}) {
  const user = await requireUser();
  const owned = db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(and(eq(schema.clients.id, input.clientId), eq(schema.clients.ownerId, user.id)))
    .get();
  if (!owned) throw new Error("Client not found.");

  const draft = await previewInvoice(input);
  if (draft.items.length === 0) throw new Error("No billable entries in this range.");

  const invoiceId = randomUUID();
  const number = `INV-${Date.now().toString(36).toUpperCase()}`;
  const issuedAt = new Date();
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 14);

  db.transaction((tx) => {
    tx.insert(schema.invoices)
      .values({
        id: invoiceId,
        clientId: input.clientId,
        number,
        status: "draft",
        issuedAt,
        dueAt,
        subtotal: draft.subtotal,
        total: draft.subtotal,
        notes: input.notes ?? null,
      })
      .run();

    tx.insert(schema.invoiceItems)
      .values(
        draft.items.map((i) => ({
          id: randomUUID(),
          invoiceId,
          description: `${i.description} — ${i.hours}h @ ${i.unitPrice}`,
          quantity: i.hours,
          unitPrice: i.unitPrice,
          amount: i.amount,
        })),
      )
      .run();
  });

  revalidatePath("/invoices");
  return { invoiceId, number };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
