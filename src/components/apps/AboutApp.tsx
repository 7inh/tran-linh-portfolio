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
      <div className="space-y-5 p-4 pb-10 sm:p-5 sm:pb-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-border">
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
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {profile.name}
            </h1>
            <p className="text-sm font-medium text-primary">
              {profile.role}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.fullName} · {years}+ years of experience
            </p>
          </div>
        </div>

        <p className="text-[13.5px] leading-relaxed text-foreground/85">
          {profile.bio}
        </p>

        <Separator className="dark:bg-white/10" />

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Education
          </h2>
          <p className="text-sm font-medium text-foreground">
            {profile.education.degree}
          </p>
          <p className="text-[13px] text-foreground/75">
            {profile.education.school}, {profile.education.location} ·{" "}
            {profile.education.year}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Languages
          </h2>
          <ul className="space-y-1 text-[13px] text-foreground/85">
            {profile.languages.map((lang) => (
              <li key={lang.name}>
                <span className="font-medium">{lang.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {lang.level}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Skills
          </h2>
          <div className="space-y-3">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-[12px] font-medium text-foreground/75">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="rounded-md font-normal"
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
