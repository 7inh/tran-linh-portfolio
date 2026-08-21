"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function ProjectsApp() {
  const featured = projects.filter((p) => p.kind === "featured");
  const side = projects.filter((p) => p.kind === "side");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-5 pb-8">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Featured work
          </h2>
          <div className="space-y-3">
            {featured.map((project) => (
              <ProjectBlock key={project.name} project={project} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Side projects
          </h2>
          <div className="space-y-3">
            {side.map((project) => (
              <ProjectBlock key={project.name} project={project} />
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

function ProjectBlock({
  project,
  featured,
}: {
  project: (typeof projects)[number];
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white/60 p-4",
        featured && "border-teal-200/80 bg-teal-50/40"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-900">
          {project.name}
        </h3>
        <span className="text-[11px] tabular-nums text-slate-500">
          {project.period}
        </span>
      </div>
      {project.company && (
        <p className="mt-0.5 text-[12px] font-medium text-teal-700">
          {project.company}
        </p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
        {project.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="rounded-md bg-slate-100/90 font-normal text-slate-700"
          >
            {tech}
          </Badge>
        ))}
      </div>
    </article>
  );
}
