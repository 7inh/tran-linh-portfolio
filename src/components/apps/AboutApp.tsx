"use client";

import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { profile, getYearsOfExperience } from "@/data/portfolio";

export function AboutApp() {
  const years = getYearsOfExperience();
  const skillGroups = [
    { label: "Languages", items: profile.skills.languages },
    { label: "Frontend", items: profile.skills.frontend },
    { label: "Backend", items: profile.skills.backend },
    { label: "Databases", items: profile.skills.databases },
    { label: "Testing", items: profile.skills.testing },
    { label: "DevOps", items: profile.skills.devops },
    { label: "Other", items: profile.skills.other },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-5 pb-8">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80 dark:ring-white/15">
            <Image
              src="/brand/avatar-icon.png"
              alt=""
              width={64}
              height={64}
              className="size-full object-cover"
              priority
              unoptimized
            />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {profile.name}
            </h1>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
              {profile.role}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {profile.fullName} · {years}+ years of experience
            </p>
          </div>
        </div>

        <p className="text-[13.5px] leading-relaxed text-slate-700 dark:text-zinc-200">
          {profile.bio}
        </p>

        <Separator className="dark:bg-white/10" />

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Education
          </h2>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {profile.education.degree}
          </p>
          <p className="text-[13px] text-slate-600 dark:text-zinc-300">
            {profile.education.school}, {profile.education.location} ·{" "}
            {profile.education.year}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Languages
          </h2>
          <ul className="space-y-1 text-[13px] text-slate-700 dark:text-zinc-200">
            {profile.languages.map((lang) => (
              <li key={lang.name}>
                <span className="font-medium">{lang.name}</span>
                <span className="text-slate-500 dark:text-zinc-400">
                  {" "}
                  — {lang.level}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Skills
          </h2>
          <div className="space-y-3">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-[12px] font-medium text-slate-600 dark:text-zinc-300">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="rounded-md bg-slate-100/90 font-normal text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
