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
import { ArrowRight, ArrowUpRight } from "lucide-react";

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
    <div className="relative min-h-screen mosaic-bg">

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(58,58,56,0.15)] bg-[#F7F7F5]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3 md:px-12 lg:px-24">
          {/* Square logo mark */}
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center border border-[#1A3C2B] bg-[#1A3C2B] text-[#F7F7F5] font-mono text-xs font-bold tracking-widest"
          >
            {profile?.name?.charAt(0) ?? "H"}
          </Link>

          {/* Numbered nav links */}
          <ul className="hidden items-center gap-8 md:flex">
            {[
              { n: "01", label: "About", href: "#about" },
              { n: "02", label: "Experience", href: "#experience" },
              { n: "03", label: "Projects", href: "#projects" },
              { n: "04", label: "Writing", href: "#blog" },
            ].map(({ n, label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="group flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[rgba(58,58,56,0.55)] transition-colors hover:text-[#1A3C2B]"
                >
                  <span className="text-[#FF8C69]">{n}.</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Resume link */}
          {profile?.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden border border-[#1A3C2B] px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-[#1A3C2B] transition-colors hover:bg-[#1A3C2B] hover:text-[#F7F7F5] sm:inline-flex"
            >
              Résumé
            </a>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-screen-xl px-6 pt-16 md:px-12 lg:px-24">
        <div className="lg:flex lg:justify-between lg:gap-8">

          {/* ── LEFT PANEL (sticky) ── */}
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[42%] lg:flex-col lg:justify-between lg:py-24">
            <div>
              {/* Profile photo — square, forest border */}
              {profile?.photoUrl && (
                <div className="mb-8 h-16 w-16 overflow-hidden border border-[rgba(58,58,56,0.3)]">
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  />
                </div>
              )}

              {/* Name — Space Grotesk, large, forest */}
              <h1
                className="font-display text-4xl font-bold tracking-tight text-[#1A3C2B] sm:text-5xl"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                {profile?.name ?? "Your Name"}
              </h1>

              {/* Role — medium weight */}
              <h2 className="mt-2 text-base font-medium tracking-tight text-[rgba(58,58,56,0.7)]">
                {profile?.role ?? "Software Engineer"}
              </h2>

              {/* Tagline */}
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[rgba(58,58,56,0.6)]">
                {profile?.tagline ?? ""}
              </p>

              {/* Status badge */}
              <div className="mt-6 inline-flex items-center gap-2 border border-[rgba(58,58,56,0.15)] px-3 py-1.5">
                <span className="h-2 w-2 bg-[#9EFFBF]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[rgba(58,58,56,0.6)]">
                  Available for opportunities
                </span>
              </div>

              {/* Scroll nav */}
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
          <main className="pt-24 lg:w-[58%] lg:py-24">

            {/* About */}
            <section id="about" className="mb-20 scroll-mt-20">
              <SectionLabel number="01" label="About" />

              {profile?.bio ? (
                <div
                  className="mt-6 space-y-4 text-sm leading-relaxed text-[rgba(58,58,56,0.75)] [&_a]:font-medium [&_a]:text-[#1A3C2B] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#FF8C69] [&_strong]:font-semibold [&_strong]:text-[#1A3C2B]"
                  dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
              ) : (
                <p className="mt-6 text-sm text-[rgba(58,58,56,0.5)]">
                  Add your bio in the admin dashboard.
                </p>
              )}

              {profile?.resumeUrl && (
                <div className="mt-6">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 border-b border-[#1A3C2B] pb-0.5 font-mono text-xs uppercase tracking-widest text-[#1A3C2B] transition-colors hover:border-[#FF8C69] hover:text-[#FF8C69]"
                  >
                    View Full Résumé
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              )}
            </section>

            {/* Experience */}
            <section id="experience" className="mb-20 scroll-mt-20">
              <SectionLabel number="02" label="Experience" />

              {experiences.length > 0 ? (
                <ol className="mt-2 divide-y divide-[rgba(58,58,56,0.1)]">
                  {experiences.map((exp) => (
                    <li key={exp.id} className="py-1">
                      <ExperienceCard exp={exp} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-[rgba(58,58,56,0.4)]">No experience entries yet.</p>
              )}

              <div className="mt-8">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2 border-b border-[#1A3C2B] pb-0.5 font-mono text-xs uppercase tracking-widest text-[#1A3C2B] transition-colors hover:border-[#FF8C69] hover:text-[#FF8C69]"
                >
                  View Full Archive
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>

            {/* Projects */}
            <section id="projects" className="mb-20 scroll-mt-20">
              <SectionLabel number="03" label="Projects" />

              {projects.length > 0 ? (
                <ol className="mt-2 divide-y divide-[rgba(58,58,56,0.1)]">
                  {projects.map((project) => (
                    <li key={project.id} className="py-1">
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-[rgba(58,58,56,0.4)]">No projects yet.</p>
              )}

              <div className="mt-8">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2 border-b border-[#1A3C2B] pb-0.5 font-mono text-xs uppercase tracking-widest text-[#1A3C2B] transition-colors hover:border-[#FF8C69] hover:text-[#FF8C69]"
                >
                  View Full Project Archive
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>

            {/* Writing / Blog */}
            <section id="blog" className="mb-20 scroll-mt-20">
              <SectionLabel number="04" label="Writing" />

              {recentPosts.length > 0 ? (
                <ol className="mt-4 space-y-0 divide-y divide-[rgba(58,58,56,0.1)]">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block py-5 transition-colors hover:bg-[rgba(26,60,43,0.03)]"
                      >
                        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[rgba(58,58,56,0.45)]">
                          {post.publishedAt ? formatDate(post.publishedAt) : ""}
                          {" · "}
                          <span>{post.category.toLowerCase()}</span>
                        </p>
                        <h3 className="font-semibold text-[#1A3C2B] transition-colors group-hover:text-[#FF8C69]">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-1 text-sm text-[rgba(58,58,56,0.55)] line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}
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
                <p className="mt-6 text-sm text-[rgba(58,58,56,0.4)]">No posts published yet.</p>
              )}

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 border-b border-[#1A3C2B] pb-0.5 font-mono text-xs uppercase tracking-widest text-[#1A3C2B] transition-colors hover:border-[#FF8C69] hover:text-[#FF8C69]"
                >
                  View All Posts
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
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

/* ── Section label with L-corner marker ── */
function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* L-shaped corner marker */}
      <div className="relative h-5 w-5 flex-shrink-0">
        <span className="absolute left-0 top-0 h-full w-px bg-[#1A3C2B]" />
        <span className="absolute left-0 top-0 h-px w-full bg-[#1A3C2B]" />
      </div>
      <span className="font-mono text-[10px] text-[#FF8C69]">{number}.</span>
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#1A3C2B]"
        style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}>
        {label}
      </h2>
      <span className="flex-1 border-t border-[rgba(58,58,56,0.15)]" />
    </div>
  );
}
