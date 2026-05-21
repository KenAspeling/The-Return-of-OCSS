"use client";

import { useMemo, useState, useTransition } from "react";
import { createEntryFromText } from "../actions/entries";
import { parseEntry } from "@/lib/parse-entry";
import { IconBolt, IconSparkle } from "./icon";

const KNOWN = ["Acme Redesign", "Internal Ops", "Globex API"]; // visual hint only; server validates

export function QuickEntry({ projectNames = KNOWN }: { projectNames?: string[] }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const preview = useMemo(() => (input.trim() ? parseEntry(input, projectNames) : null), [input, projectNames]);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim()) return;
        start(async () => {
          try {
            const res = await createEntryFromText(input);
            setFeedback(`✓ Logged ${res.minutes}m to ${res.project}`);
            setInput("");
          } catch (err) {
            setFeedback(err instanceof Error ? err.message : "Failed");
          }
        });
      }}
    >
      <div className="surface relative p-1.5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="2h on Acme redesign — pushed the nav refactor"
          className="min-h-24 w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-[var(--color-dim)]"
        />
        <div className="flex items-center gap-2 border-t border-[color-mix(in_oklch,var(--color-line)_70%,transparent)] px-3 py-2">
          <IconSparkle className="text-[var(--color-brand-soft)]" size={14} />
          <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">Recognised</span>
          {preview ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip on={preview.durationMinutes > 0}>{preview.durationMinutes || 0}m</Chip>
              <Chip on={!!preview.projectHint}>{preview.projectHint ?? "no project"}</Chip>
              <Chip on={!preview.billable} tone="violet">
                {preview.billable ? "billable" : "non-billable"}
              </Chip>
            </div>
          ) : (
            <span className="text-xs text-[var(--color-dim)]">
              Try <code className="font-mono">2h</code>, <code className="font-mono">90m</code>, <code className="font-mono">1:30</code>, project name, <code className="font-mono">non-billable</code>.
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {feedback && <span className="text-xs text-[var(--color-muted)]">{feedback}</span>}
            <button type="submit" disabled={pending || !input.trim()} className="btn btn-primary">
              <IconBolt size={14} />
              {pending ? "Logging…" : "Log it"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Chip({
  children,
  on,
  tone = "brand",
}: {
  children: React.ReactNode;
  on: boolean;
  tone?: "brand" | "violet";
}) {
  const accent = tone === "violet" ? "var(--color-violet)" : "var(--color-brand)";
  return (
    <span
      className="chip"
      style={
        on
          ? {
              background: `color-mix(in oklch, ${accent} 18%, transparent)`,
              borderColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
              color: `color-mix(in oklch, ${accent} 80%, white)`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
