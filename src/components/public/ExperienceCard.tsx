import { TagPill } from "./TagPill";
import type { ExperienceWithRelations } from "@/types";
import { ArrowUpRight } from "lucide-react";

export function ExperienceCard({ exp }: { exp: ExperienceWithRelations }) {
  return (
    <div className="group relative p-4 transition-colors duration-200 hover:bg-[rgba(26,60,43,0.04)]">
      <div className="grid gap-4 sm:grid-cols-8">
        <div className="sm:col-span-2">
          <p
            className="mt-1 text-[10px] uppercase tracking-widest text-[rgba(58,58,56,0.45)]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {exp.period}
          </p>
        </div>
        <div className="sm:col-span-6">
          <h3 className="font-semibold leading-snug text-[#1A3C2B]">
            {exp.company ? (
              exp.companyUrl ? (
                <a
                  href={exp.companyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#FF8C69] group/link"
                >
                  {exp.title} ·{" "}
                  <span className="text-[rgba(58,58,56,0.6)] group-hover/link:text-[#FF8C69]">
                    {exp.company}
                  </span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
                </a>
              ) : (
                <>
                  {exp.title} ·{" "}
                  <span className="font-normal text-[rgba(58,58,56,0.6)]">{exp.company}</span>
                </>
              )
            ) : (
              exp.title
            )}
          </h3>
          {exp.description && (
            <div
              className="mt-2 text-sm leading-relaxed text-[rgba(58,58,56,0.65)] [&_strong]:font-semibold [&_strong]:text-[#1A3C2B] [&_ul]:list-disc [&_ul]:pl-4"
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
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1A3C2B] transition-colors hover:text-[#FF8C69]"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
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
