"use client";

import { useTransition } from "react";
import { toggleArchiveProject } from "@/app/actions/projects";
import { IconArchive } from "@/app/_components/icon";

export function ArchiveButton({ id, archived }: { id: string; archived: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await toggleArchiveProject(id); })}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs text-[var(--color-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-40"
    >
      <IconArchive size={12} />
      {archived ? "Unarchive" : "Archive"}
    </button>
  );
}
