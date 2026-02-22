import Image from "next/image";
import { TagPill } from "./TagPill";
import type { ProjectWithTags } from "@/types";
import { ArrowUpRight, Github } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectWithTags }) {
  return (
    <div className="group relative p-4 transition-colors duration-200 hover:bg-[rgba(26,60,43,0.04)]">
      <div className="flex gap-4">
        {project.imageUrl && (
          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden border border-[rgba(58,58,56,0.2)]">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover mix-blend-luminosity opacity-90 transition-all duration-300 group-hover:mix-blend-normal group-hover:opacity-100"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold leading-snug text-[#1A3C2B]">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-[#FF8C69] group/link"
              >
                {project.title}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            ) : (
              project.title
            )}
          </h3>
          {project.stats && (
            <p
              className="mt-0.5 text-[10px] text-[#FF8C69]"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {project.stats}
            </p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-[rgba(58,58,56,0.65)] line-clamp-2">
            {project.description}
          </p>
          <div className="mt-2 flex items-center gap-3">
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag.id}>
                    <TagPill label={tag.label} />
                  </li>
                ))}
              </ul>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex-shrink-0 text-[rgba(58,58,56,0.45)] transition-colors hover:text-[#1A3C2B]"
                aria-label="View on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
