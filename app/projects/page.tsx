import { listClients, listProjects } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { ProjectForm } from "./_components/project-form";
import { ArchiveButton } from "./_components/archive-button";

export default function ProjectsPage() {
  const projects = listProjects();
  const clients = listClients();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Projects</span>
        <h1 className="text-3xl font-semibold">{projects.length} project{projects.length === 1 ? "" : "s"}</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Add project</h2>
        <ProjectForm clients={clients} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">All projects</h2>
        <ul className="flex flex-col divide-y divide-zinc-900 rounded-lg border border-zinc-900 bg-zinc-900/30">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
              <div className="flex-1">
                <div className="font-medium">
                  {p.name}
                  {p.archivedAt && <span className="ml-2 text-xs text-zinc-500">(archived)</span>}
                </div>
                <div className="text-xs text-zinc-500">
                  {p.clientName} {p.code && `· ${p.code}`}
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                {p.billable ? (p.hourlyRate ? formatMoney(p.hourlyRate) + "/h" : "billable") : "non-billable"}
              </div>
              <ArchiveButton id={p.id} archived={!!p.archivedAt} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
