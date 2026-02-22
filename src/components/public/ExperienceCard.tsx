import { TagPill } from "./TagPill";
import type { ExperienceWithRelations } from "@/types";
import { ArrowUpRight } from "lucide-react";

export function ExperienceCard({ exp }: { exp: ExperienceWithRelations }) {
  return (
    <div className="group relative rounded-lg p-4 transition-all duration-300 hover:bg-[rgba(30,41,59,0.5)] hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] hover:drop-shadow-lg">
      <div className="grid gap-4 sm:grid-cols-8">
        <div className="sm:col-span-2">
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
            {exp.period}
          </p>
        </div>
        <div className="sm:col-span-6">
          <h3 className="font-medium leading-snug text-[#e2e8f0]">
            {exp.company ? (
              exp.companyUrl ? (
                <a
                  href={exp.companyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#5eead4] transition-colors group/link"
                >
                  {exp.title} ·{" "}
                  <span className="text-[#94a3b8] group-hover/link:text-[#5eead4]">
                    {exp.company}
                  </span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              ) : (
                <>
                  {exp.title} ·{" "}
                  <span className="text-[#94a3b8]">{exp.company}</span>
                </>
              )
            ) : (
              exp.title
            )}
          </h3>
          {exp.description && (
            <div
              className="mt-2 text-sm text-[#94a3b8] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: exp.description }}
            />
          )}
          {exp.links.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-3">
              {exp.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#e2e8f0] hover:text-[#5eead4] transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {exp.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {exp.tags.map((tag) => (
                <li key={tag.id}>
                  <TagPill label={tag.label} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
