"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { experience } from "@/data/portfolio";

function PromptLine({ trailingCursor }: { trailingCursor?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className="text-emerald-400">tran@portfolio</span>
      <span className="text-zinc-600">:</span>
      <span className="text-sky-400">~</span>
      <span className="text-zinc-500">$</span>
      {trailingCursor && (
        <span className="ml-0.5 inline-block h-[13px] w-[7px] animate-pulse bg-zinc-300" />
      )}
    </div>
  );
}

export function ExperienceApp() {
  return (
    <ScrollArea className="h-full bg-[#161616] dark:bg-[#101010]">
      <div className="space-y-6 p-4 pb-10 font-mono text-[12.5px] leading-relaxed text-zinc-300 sm:p-5 sm:pb-8">
        <div>
          <PromptLine />
          <p className="mt-1 text-zinc-500">cat experience.log</p>
        </div>

        {experience.map((job, index) => (
          <article key={`${job.company}-${job.period}`}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-emerald-400">#{index + 1}</span>
              <h3 className="min-w-0 break-words font-semibold text-white">
                {job.company}
              </h3>
              <span className="text-zinc-500">[{job.period}]</span>
            </div>

            <p className="mt-1">
              <span className="text-amber-300">role</span>
              <span className="text-zinc-600">: </span>
              <span className="text-zinc-200">{job.role}</span>
              {job.teamSize ? (
                <span className="text-zinc-500"> · team_size: {job.teamSize}</span>
              ) : null}
            </p>
            <p>
              <span className="text-amber-300">project</span>
              <span className="text-zinc-600">: </span>
              <span className="text-zinc-200">{job.project}</span>
            </p>

            {job.context && (
              <p className="mt-2 text-zinc-500"># {job.context}</p>
            )}

            {job.functions && job.functions.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {job.functions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0 text-sky-400">-</span>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-2 space-y-0.5">
              {job.responsibilities.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="shrink-0 text-emerald-400">$</span>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-2 text-zinc-500">
              tech: [
              <span className="text-fuchsia-300">
                {job.technologies.join(", ")}
              </span>
              ]
            </p>
          </article>
        ))}

        <PromptLine trailingCursor />
      </div>
    </ScrollArea>
  );
}
