import { getProjects } from "@/actions/projects";
import { TagPill } from "@/components/public/TagPill";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";

export const revalidate = 300;

export default async function ArchivePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen mosaic-bg text-forest">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-forest"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>

        <h1
          className="text-3xl font-bold tracking-tight text-forest mb-2"
          style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
        >
          All Projects
        </h1>
        <p className="text-sm text-ink/60 mb-10">
          A full archive of things I&apos;ve built over the years.
        </p>

        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b border-ink/15 text-[10px] uppercase tracking-widest text-ink/45"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  <th className="pb-4 pr-6 font-medium">Year</th>
                  <th className="pb-4 pr-6 font-medium">Project</th>
                  <th className="hidden pb-4 pr-6 font-medium md:table-cell">Description</th>
                  <th className="hidden pb-4 pr-6 font-medium sm:table-cell">Tags</th>
                  <th className="pb-4 font-medium">Links</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-ink/8 transition-colors hover:bg-forest/4"
                  >
                    <td
                      className="py-4 pr-6 text-[10px] text-ink/45 align-top whitespace-nowrap"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {project.createdAt.getFullYear()}
                    </td>
                    <td className="py-4 pr-6 align-top">
                      <span className="font-semibold text-forest">
                        {project.title}
                      </span>
                      {project.featured && (
                        <span
                          className="ml-2 border border-mint bg-mint/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-forest"
                          style={{ fontFamily: "var(--font-jetbrains-mono), monospace", borderRadius: "2px" }}
                        >
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="hidden py-4 pr-6 text-sm text-ink/60 align-top md:table-cell max-w-xs">
                      <p className="line-clamp-2">{project.description}</p>
                    </td>
                    <td className="hidden py-4 pr-6 align-top sm:table-cell">
                      <ul className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <li key={tag.id}>
                            <TagPill label={tag.label} />
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 align-top">
                      <div className="flex items-center gap-2">
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ink/45 transition-colors hover:text-forest"
                            aria-label={`Visit ${project.title}`}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ink/45 transition-colors hover:text-forest"
                            aria-label={`${project.title} on GitHub`}
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/40">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
