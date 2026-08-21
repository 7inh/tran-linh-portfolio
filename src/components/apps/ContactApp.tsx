"use client";

import { useState } from "react";
import { Check, Code2, Copy, Link2, Mail, MapPin } from "lucide-react";
import { profile } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const links = [
  {
    label: "Email",
    href: `mailto:${profile.contact.email}`,
    value: profile.contact.email,
    copyValue: profile.contact.email,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: profile.contact.linkedin,
    value: "linkedin.com/in/tql247",
    copyValue: profile.contact.linkedin,
    icon: Link2,
  },
  {
    label: "GitHub",
    href: profile.contact.github,
    value: "github.com/7inh",
    copyValue: profile.contact.github,
    icon: Code2,
  },
] as const;

export function ContactApp() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => {
        setCopied((current) => (current === label ? null : current));
      }, 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-full flex-col justify-between p-5 pb-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-slate-900">
          Let’s connect
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
          Open to fullstack roles, AI product work, and thoughtful collaborations.
        </p>

        <div className="mt-5 flex items-center gap-2 text-[13px] text-slate-600">
          <MapPin className="h-4 w-4 text-teal-600" />
          {profile.contact.location}
        </div>

        <ul className="mt-5 space-y-2">
          {links.map((link) => {
            const isCopied = copied === link.label;
            return (
              <li
                key={link.label}
                className="flex items-stretch gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 p-1.5 transition hover:border-teal-300 hover:bg-teal-50/40"
              >
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    link.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-600 text-white">
                    <link.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {link.label}
                    </span>
                    <span className="block truncate text-[13px] font-medium text-slate-800">
                      {link.value}
                    </span>
                  </span>
                </a>
                <button
                  type="button"
                  aria-label={`Copy ${link.label}`}
                  title={isCopied ? "Copied" : "Copy"}
                  className="flex h-auto w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  onClick={() => copyValue(link.label, link.copyValue)}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <a
        href={`mailto:${profile.contact.email}`}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        Send an email
      </a>
    </div>
  );
}
