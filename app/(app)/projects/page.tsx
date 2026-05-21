import { listClients, listProjects } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { colorFor } from "@/lib/color";
import { ProjectForm } from "./_components/project-form";
import { ArchiveButton } from "./_components/archive-button";
import { IconBriefcase, IconPlus } from "@/app/_components/icon";

type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([listProjects(), listClients()]);
  const active = projects.filter((p) => !p.archivedAt);
  const archived = projects.filter((p) => p.archivedAt);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-dim)]">Projects</span>
        <h1 className="text-4xl font-semibold tracking-tight">
          {active.length} active <span className="text-[var(--color-dim)]">/ {projects.length} total</span>
        </h1>
        <p className="text-sm text-[var(--color-muted)]">Add clients and projects to start billing.</p>
      </header>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconPlus size={14} />}>Add new</SectionHeading>
        <ProjectForm clients={clients} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading icon={<IconBriefcase size={14} />}>Active</SectionHeading>
        {active.length === 0 ? (
          <div className="surface p-8 text-center text-sm text-[var(--color-muted)]">No active projects yet.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading>Archived</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {archived.map((p) => (
              <ProjectCard key={p.id} project={p} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  muted = false,
}: {
  project: ProjectListItem;
  muted?: boolean;
}) {
  const c = colorFor(project.name);
  return (
    <div
      className="surface relative overflow-hidden p-4 transition-transform hover:-translate-y-0.5"
      style={muted ? { opacity: 0.55 } : undefined}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: `linear-gradient(180deg, ${c.fg}, transparent)` }}
      />
      <div className="flex items-start gap-4 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{project.name}</span>
            {project.code && (
              <span className="chip font-mono" style={{ color: c.fg, borderColor: `color-mix(in oklch, ${c.fg} 40%, transparent)` }}>
                {project.code}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{project.clientName}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className="chip"
            style={
              project.billable
                ? { color: "var(--color-brand)", borderColor: "color-mix(in oklch, var(--color-brand) 40%, transparent)" }
                : { color: "var(--color-violet)", borderColor: "color-mix(in oklch, var(--color-violet) 40%, transparent)" }
            }
          >
            {project.billable ? "billable" : "non-billable"}
          </span>
          {project.hourlyRate ? (
            <span className="font-mono text-sm tabular-nums">{formatMoney(project.hourlyRate)}/h</span>
          ) : (
            <span className="text-xs text-[var(--color-dim)]">no rate</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end pl-2">
        <ArchiveButton id={project.id} archived={!!project.archivedAt} />
      </div>
    </div>
  );
}

function SectionHeading({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-[var(--color-brand-soft)]">{icon}</span>}
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">{children}</h2>
      <div className="ml-2 flex-1">
        <hr className="hr-soft" />
      </div>
    </div>
  );
}
