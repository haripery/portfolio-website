import Image from "next/image";
import { TagPill } from "./TagPill";
import type { ProjectWithTags } from "@/types";
import { ArrowUpRight, Github } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectWithTags }) {
  return (
    <div className="group relative p-4 transition-colors duration-200 hover:bg-forest/4">
      <div className="flex gap-4">
        {project.imageUrl && (
          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden border border-ink/20">
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
          <h3 className="font-semibold leading-snug text-forest">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-coral group/link"
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
              className="mt-0.5 text-[10px] text-coral"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {project.stats}
            </p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-ink/65 line-clamp-2">
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
                className="ml-auto flex-shrink-0 text-ink/45 transition-colors hover:text-forest"
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
