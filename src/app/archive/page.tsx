import { getProjects } from "@/actions/projects";
import { TagPill } from "@/components/public/TagPill";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";

export const revalidate = 300;

export default async function ArchivePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#5eead4] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-[#e2e8f0] mb-2">
          All Projects
        </h1>
        <p className="text-[#94a3b8] mb-10">
          A full archive of things I&apos;ve built over the years.
        </p>

        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                  <th className="pb-4 pr-6">Year</th>
                  <th className="pb-4 pr-6">Project</th>
                  <th className="hidden pb-4 pr-6 md:table-cell">Description</th>
                  <th className="hidden pb-4 pr-6 sm:table-cell">Tags</th>
                  <th className="pb-4">Links</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 transition-colors hover:bg-[rgba(30,41,59,0.3)]"
                  >
                    <td className="py-4 pr-6 text-sm text-[#94a3b8] align-top whitespace-nowrap">
                      {project.createdAt.getFullYear()}
                    </td>
                    <td className="py-4 pr-6 align-top">
                      <span className="font-medium text-[#e2e8f0]">
                        {project.title}
                      </span>
                      {project.featured && (
                        <span className="ml-2 rounded-full bg-teal-400/10 px-2 py-0.5 text-xs text-[#5eead4] ring-1 ring-inset ring-teal-400/20">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="hidden py-4 pr-6 text-sm text-[#94a3b8] align-top md:table-cell max-w-xs">
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
                            className="text-[#94a3b8] hover:text-[#5eead4] transition-colors"
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
                            className="text-[#94a3b8] hover:text-[#5eead4] transition-colors"
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
          <p className="text-[#64748b]">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
