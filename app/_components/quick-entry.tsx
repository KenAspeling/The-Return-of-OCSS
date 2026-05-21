"use client";

import { useState, useTransition } from "react";
import { parseQuickEntry } from "../actions/parse-quick-entry";
import type { ParsedEntry } from "@/lib/ai/parse-entry";

export function QuickEntry() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParsedEntry | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await parseQuickEntry(input)));
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="2h on Acme redesign this morning, pushed the nav refactor"
        className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-900 p-4 outline-none focus:border-zinc-600"
      />
      <button
        type="submit"
        disabled={pending || !input.trim()}
        className="self-start rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
      >
        {pending ? "Parsing…" : "Log it"}
      </button>
      {result && (
        <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-300">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}
