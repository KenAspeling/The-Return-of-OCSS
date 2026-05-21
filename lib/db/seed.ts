import { db, schema } from "./index";
import { DEFAULT_USER_ID } from "../constants";

let seeded = false;

export function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  db.transaction((tx) => {
    tx.insert(schema.users)
      .values({ id: DEFAULT_USER_ID, email: "you@ocss.local", name: "You", hourlyRate: 100 })
      .onConflictDoNothing()
      .run();

    const existing = tx.select({ id: schema.clients.id }).from(schema.clients).limit(1).all();
    if (existing.length > 0) return;

    tx.insert(schema.clients)
      .values([
        { id: "client-acme", ownerId: DEFAULT_USER_ID, name: "Acme Corp", currency: "USD" },
        { id: "client-globex", ownerId: DEFAULT_USER_ID, name: "Globex", currency: "USD" },
        { id: "client-internal", ownerId: DEFAULT_USER_ID, name: "Internal", currency: "USD" },
      ])
      .run();

    tx.insert(schema.projects)
      .values([
        {
          id: "proj-acme-redesign",
          clientId: "client-acme",
          name: "Acme Redesign",
          code: "ACME-RD",
          billable: true,
          hourlyRate: 120,
        },
        {
          id: "proj-globex-api",
          clientId: "client-globex",
          name: "Globex API",
          code: "GLBX-API",
          billable: true,
          hourlyRate: 140,
        },
        {
          id: "proj-internal-ops",
          clientId: "client-internal",
          name: "Internal Ops",
          code: "INT",
          billable: false,
        },
      ])
      .run();

    tx.insert(schema.tasks)
      .values([
        { id: "task-acme-design", projectId: "proj-acme-redesign", name: "Design", billable: true },
        { id: "task-acme-dev", projectId: "proj-acme-redesign", name: "Development", billable: true },
        { id: "task-globex-dev", projectId: "proj-globex-api", name: "Development", billable: true },
        { id: "task-globex-mtg", projectId: "proj-globex-api", name: "Meetings", billable: true },
        { id: "task-int-admin", projectId: "proj-internal-ops", name: "Admin", billable: false },
      ])
      .run();
  });
}
