"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  createUserWithPassword,
  destroySession,
  findUserByEmail,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string } | null;

function clean(input: FormDataEntryValue | null): string {
  return typeof input === "string" ? input.trim() : "";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  if (!email || !password) return { error: "Email and password are required." };

  const user = await findUserByEmail(email);
  if (!user) return { error: "Invalid email or password." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  await createSession(user.id);
  redirect("/");
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  if (!name || !email || !password) return { error: "All fields are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!/.+@.+\..+/.test(email)) return { error: "Enter a valid email address." };

  try {
    const id = await createUserWithPassword({ name, email, password });
    await createSession(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to sign up." };
  }
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
