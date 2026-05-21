"use server";

import { parseTimeEntry } from "@/lib/ai/parse-entry";

export async function parseQuickEntry(input: string) {
  return parseTimeEntry(input, ["Acme Redesign", "Internal", "Globex API"]);
}
