import "server-only";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, randomUUID } from "node:crypto";
import { db, schema } from "./db";

export const SESSION_COOKIE = "ocss_session";
const SESSION_DAYS = 30;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<void> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  db.insert(schema.sessions).values({ id, userId, expiresAt }).run();

  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  hourlyRate: number | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const row = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      hourlyRate: schema.users.hourlyRate,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, sessionId), gt(schema.sessions.expiresAt, new Date())))
    .get();

  return row ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId)).run();
  }
  jar.delete(SESSION_COOKIE);
}

export async function createUserWithPassword(input: {
  email: string;
  name: string;
  password: string;
}): Promise<string> {
  const existing = db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, input.email.toLowerCase()))
    .get();
  if (existing) throw new Error("An account with that email already exists.");

  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);

  db.insert(schema.users)
    .values({
      id,
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
    })
    .run();

  return id;
}

export async function findUserByEmail(email: string) {
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .get();
}
