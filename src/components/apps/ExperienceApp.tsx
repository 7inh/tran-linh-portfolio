"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { experience } from "@/data/portfolio";

export function ExperienceApp() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-4 pb-10 sm:p-5 sm:pb-8">
        {experience.map((job, index) => (
          <div key={`${job.company}-${job.period}`}>
            <article className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="min-w-0 break-words font-[family-name:var(--font-display)] text-[15px] font-semibold text-slate-900 dark:text-white">
                  {job.company}
                </h3>
                <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                  {job.period}
                </span>
              </div>
              <p className="text-[13px] font-medium text-teal-700 dark:text-teal-300">
                {job.role}
                {job.teamSize ? (
                  <span className="font-normal text-slate-500 dark:text-zinc-400">
                    {" "}
                    · Team of {job.teamSize}
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[12.5px] text-slate-600 dark:text-zinc-300">
                {job.project}
              </p>

              {job.context && (
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-zinc-300">
                  {job.context}
                </p>
              )}

              {job.functions && job.functions.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] text-slate-700 dark:text-zinc-200">
                  {job.functions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] text-slate-700 dark:text-zinc-200">
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="rounded-md bg-slate-100/90 font-normal text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </article>
            {index < experience.length - 1 && (
              <Separator className="dark:bg-white/10" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
