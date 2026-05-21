export type ParsedEntry = {
  projectHint: string | null;
  durationMinutes: number;
  notes: string;
  billable: boolean;
};

const HOURS = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i;
const MINUTES = /(\d+)\s*(?:m|min|mins|minute|minutes)\b/i;
const HHMM = /\b(\d{1,2}):(\d{2})\b/;
const NON_BILLABLE = /\b(non[-\s]?billable|nb|internal)\b/i;

export function parseEntry(input: string, projects: string[]): ParsedEntry {
  const text = input.trim();
  let minutes = 0;

  const hhmm = text.match(HHMM);
  if (hhmm) {
    minutes = parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  } else {
    const h = text.match(HOURS);
    const m = text.match(MINUTES);
    if (h) minutes += Math.round(parseFloat(h[1]) * 60);
    if (m) minutes += parseInt(m[1], 10);
  }

  const billable = !NON_BILLABLE.test(text);

  const projectHint = matchProject(text, projects);

  const notes = text
    .replace(HOURS, "")
    .replace(MINUTES, "")
    .replace(HHMM, "")
    .replace(NON_BILLABLE, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,\-–—:]+|[\s,\-–—:]+$/g, "")
    .trim();

  return { projectHint, durationMinutes: minutes, notes, billable };
}

function matchProject(text: string, projects: string[]): string | null {
  const lower = text.toLowerCase();
  let best: { name: string; score: number } | null = null;
  for (const name of projects) {
    const tokens = name.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = tokens.filter((t) => lower.includes(t)).length;
    if (hits === 0) continue;
    const score = hits / tokens.length;
    if (!best || score > best.score) best = { name, score };
  }
  return best && best.score >= 0.5 ? best.name : null;
}
