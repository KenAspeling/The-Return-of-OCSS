"use client";

import { useState, useTransition } from "react";
import { createEntryFromText } from "../actions/entries";

export function QuickEntry() {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim()) return;
        start(async () => {
          try {
            const res = await createEntryFromText(input);
            setFeedback(`Logged ${res.minutes}m to ${res.project}`);
            setInput("");
          } catch (err) {
            setFeedback(err instanceof Error ? err.message : "Failed");
          }
        });
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="2h on Acme redesign — pushed the nav refactor"
        className="min-h-20 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm outline-none focus:border-zinc-600"
      />
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
        >
          {pending ? "Logging…" : "Log it"}
        </button>
        {feedback && <span className="text-xs text-zinc-400">{feedback}</span>}
      </div>
      <p className="text-xs text-zinc-500">
        Recognised: <code className="text-zinc-400">2h</code>, <code className="text-zinc-400">90m</code>, <code className="text-zinc-400">1:30</code>, project name, <code className="text-zinc-400">non-billable</code>.
      </p>
    </form>
  );
}
