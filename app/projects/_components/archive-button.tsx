"use client";

import { useTransition } from "react";
import { toggleArchiveProject } from "@/app/actions/projects";

export function ArchiveButton({ id, archived }: { id: string; archived: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await toggleArchiveProject(id); })}
      disabled={pending}
      className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-40"
    >
      {archived ? "Unarchive" : "Archive"}
    </button>
  );
}
