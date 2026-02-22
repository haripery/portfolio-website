import Image from "next/image";
import { TagPill } from "./TagPill";
import type { ProjectWithTags } from "@/types";
import { ArrowUpRight, Github } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectWithTags }) {
  return (
    <div className="group relative rounded-lg p-4 transition-all duration-300 hover:bg-[rgba(30,41,59,0.5)] hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] hover:drop-shadow-lg">
      <div className="flex gap-4">
        {project.imageUrl && (
          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded border border-white/10">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium leading-snug text-[#e2e8f0]">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#5eead4] transition-colors group/link"
              >
                {project.title}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            ) : (
              project.title
            )}
          </h3>
          {project.stats && (
            <p className="mt-0.5 text-xs text-[#5eead4]">{project.stats}</p>
          )}
          <p className="mt-1 text-sm text-[#94a3b8] leading-relaxed line-clamp-2">
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
                className="ml-auto flex-shrink-0 text-[#94a3b8] hover:text-[#5eead4] transition-colors"
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
