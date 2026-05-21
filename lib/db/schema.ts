import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const now = () => sql`(unixepoch())`;

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  hourlyRate: real("hourly_rate"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  currency: text("currency").notNull().default("USD"),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  code: text("code"),
  billable: integer("billable", { mode: "boolean" }).notNull().default(true),
  hourlyRate: real("hourly_rate"),
  budgetHours: real("budget_hours"),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  billable: integer("billable", { mode: "boolean" }).notNull().default(true),
});

export const timeEntries = sqliteTable("time_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  projectId: text("project_id").notNull().references(() => projects.id),
  taskId: text("task_id").references(() => tasks.id),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  durationSeconds: integer("duration_seconds"),
  notes: text("notes"),
  source: text("source", { enum: ["manual", "timer", "ai", "import"] }).notNull().default("manual"),
  invoiceItemId: text("invoice_item_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  number: text("number").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid", "void"] }).notNull().default("draft"),
  issuedAt: integer("issued_at", { mode: "timestamp" }),
  dueAt: integer("due_at", { mode: "timestamp" }),
  subtotal: real("subtotal").notNull().default(0),
  total: real("total").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now()),
});

export const invoiceItems = sqliteTable("invoice_items", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  amount: real("amount").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  projectId: text("project_id").references(() => projects.id),
  spentAt: integer("spent_at", { mode: "timestamp" }).notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category"),
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  billable: integer("billable", { mode: "boolean" }).notNull().default(true),
});
