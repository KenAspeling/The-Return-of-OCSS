import { generateObject } from "ai";
import { z } from "zod";
import { MODEL } from "./client";

const ParsedEntry = z.object({
  projectHint: z.string().describe("The project name or code the user mentioned, or null"),
  taskHint: z.string().nullable(),
  durationMinutes: z.number().describe("Total minutes worked"),
  startedAt: z.string().nullable().describe("ISO timestamp if user gave one"),
  notes: z.string(),
  billable: z.boolean(),
});

export type ParsedEntry = z.infer<typeof ParsedEntry>;

export async function parseTimeEntry(input: string, projectList: string[]): Promise<ParsedEntry> {
  const { object } = await generateObject({
    model: MODEL,
    schema: ParsedEntry,
    system: [
      "You convert freeform time-tracking notes into structured entries.",
      "Match the user's wording to one of these projects when possible:",
      projectList.map((p) => `- ${p}`).join("\n"),
    ].join("\n"),
    prompt: input,
  });
  return object;
}
