import { CursorSpotlight } from "@/components/public/CursorSpotlight";
import { ScrollNav } from "@/components/public/ScrollNav";
import { SocialIcons } from "@/components/public/SocialIcons";
import { ExperienceCard } from "@/components/public/ExperienceCard";
import { ProjectCard } from "@/components/public/ProjectCard";
import { TagPill } from "@/components/public/TagPill";
import { Footer } from "@/components/public/Footer";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getProjects } from "@/actions/projects";
import { getBlogPosts } from "@/actions/blog";
import { getSettings } from "@/actions/settings";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const [profile, experiences, projects, posts, settings] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects({ featured: true }),
    getBlogPosts({ published: true }),
    getSettings(),
  ]);

  const recentPosts = posts.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[#0f172a]">
      <CursorSpotlight />

      <div className="mx-auto max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-4">

          {/* ── LEFT PANEL (sticky) ── */}
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[45%] lg:flex-col lg:justify-between lg:py-24">
            <div>
              {/* Profile photo */}
              {profile?.photoUrl && (
                <div className="mb-6 w-16 h-16 rounded-full overflow-hidden border-2 border-[#334155]">
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              )}

              <h1 className="text-4xl font-bold tracking-tight text-[#e2e8f0] sm:text-5xl">
                {profile?.name ?? "Your Name"}
              </h1>
              <h2 className="mt-3 text-lg font-medium tracking-tight text-[#e2e8f0]">
                {profile?.role ?? "Software Engineer"}
              </h2>
              <p className="mt-4 max-w-xs leading-normal text-[#94a3b8]">
                {profile?.tagline ?? ""}
              </p>
              <div className="mt-10">
                <ScrollNav />
              </div>
            </div>

            {/* Social links — bottom-pinned */}
            <div className="mt-8 lg:mt-0">
              {profile?.socials && profile.socials.length > 0 && (
                <SocialIcons socials={profile.socials} />
              )}
            </div>
          </header>

          {/* ── RIGHT PANEL (scrollable) ── */}
          <main className="pt-24 lg:w-[55%] lg:py-24">

            {/* About */}
            <section
              id="about"
              className="mb-16 scroll-mt-16 lg:scroll-mt-24"
            >
              {/* Mobile section header */}
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-[#e2e8f0] lg:sr-only">
                About
              </h2>
              {profile?.bio ? (
                <div
                  className="space-y-4 text-[#94a3b8] leading-relaxed [&_a]:font-medium [&_a]:text-[#e2e8f0] [&_a]:transition-colors [&_a:hover]:text-[#5eead4] [&_strong]:font-medium [&_strong]:text-[#e2e8f0]"
                  dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
              ) : (
                <p className="text-[#94a3b8]">
                  Add your bio in the admin dashboard.
                </p>
              )}
              {profile?.resumeUrl && (
                <div className="mt-6">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 font-semibold text-[#e2e8f0] hover:text-[#5eead4] transition-colors"
                  >
                    View Full Résumé
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              )}
            </section>

            {/* Experience */}
            <section
              id="experience"
              className="mb-16 scroll-mt-16 lg:scroll-mt-24"
            >
              <h2 className="mb-6 sticky top-0 z-10 bg-[#0f172a]/80 py-2 backdrop-blur text-xs font-semibold uppercase tracking-widest text-[#e2e8f0] lg:sr-only">
                Experience
              </h2>
              {experiences.length > 0 ? (
                <ol className="group/list space-y-1">
                  {experiences.map((exp) => (
                    <li
                      key={exp.id}
                      className="transition-opacity lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
                    >
                      <ExperienceCard exp={exp} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[#64748b]">No experience entries yet.</p>
              )}
              <div className="mt-8">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2 font-semibold text-[#e2e8f0] hover:text-[#5eead4] transition-colors"
                >
                  View Full Project Archive
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>

            {/* Projects */}
            <section
              id="projects"
              className="mb-16 scroll-mt-16 lg:scroll-mt-24"
            >
              <h2 className="mb-6 sticky top-0 z-10 bg-[#0f172a]/80 py-2 backdrop-blur text-xs font-semibold uppercase tracking-widest text-[#e2e8f0] lg:sr-only">
                Projects
              </h2>
              {projects.length > 0 ? (
                <ol className="group/list space-y-1">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="transition-opacity lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
                    >
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[#64748b]">No projects yet.</p>
              )}
              <div className="mt-8">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2 font-semibold text-[#e2e8f0] hover:text-[#5eead4] transition-colors"
                >
                  View Full Project Archive
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>

            {/* Writing / Blog */}
            <section
              id="blog"
              className="mb-16 scroll-mt-16 lg:scroll-mt-24"
            >
              <h2 className="mb-6 sticky top-0 z-10 bg-[#0f172a]/80 py-2 backdrop-blur text-xs font-semibold uppercase tracking-widest text-[#e2e8f0] lg:sr-only">
                Writing
              </h2>
              {recentPosts.length > 0 ? (
                <ol className="space-y-4">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block rounded-lg p-4 transition-all hover:bg-[rgba(30,41,59,0.5)] hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]"
                      >
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                          {post.publishedAt ? formatDate(post.publishedAt) : ""}
                          {" · "}
                          <span className="capitalize">
                            {post.category.toLowerCase()}
                          </span>
                        </p>
                        <h3 className="font-medium text-[#e2e8f0] transition-colors group-hover:text-[#5eead4]">
                          {post.title}
                        </h3>
                        {post.tags.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <li key={tag.id}>
                                <TagPill label={tag.label} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[#64748b]">No posts published yet.</p>
              )}
              <div className="mt-8">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 font-semibold text-[#e2e8f0] hover:text-[#5eead4] transition-colors"
                >
                  View All Posts
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>

            <Footer text={settings?.footerText} />
          </main>
        </div>
      </div>
    </div>
  );
}
