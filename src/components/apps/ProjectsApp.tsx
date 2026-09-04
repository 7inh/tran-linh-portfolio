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
      <div className="space-y-6 p-4 pb-10 sm:p-5 sm:pb-8">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Featured work
          </h2>
          <div className="space-y-3">
            {featured.map((project) => (
              <ProjectBlock key={project.name} project={project} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
        "rounded-xl border border-border bg-card/60 p-4 dark:bg-glass/60",
        featured &&
          "border-accent-foreground/20 bg-accent dark:border-accent-foreground/25"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="min-w-0 break-words font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
          {project.name}
        </h3>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {project.period}
        </span>
      </div>
      {project.company && (
        <p className="mt-0.5 text-[12px] font-medium text-primary">
          {project.company}
        </p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
        {project.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="rounded-md font-normal"
          >
            {tech}
          </Badge>
        ))}
      </div>
    </article>
  );
}
