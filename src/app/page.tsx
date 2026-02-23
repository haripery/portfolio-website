import { ScrollNav } from "@/components/public/ScrollNav";
import { SocialIcons } from "@/components/public/SocialIcons";
import { ExperienceCard } from "@/components/public/ExperienceCard";
import { ProjectCard } from "@/components/public/ProjectCard";
import { TagPill } from "@/components/public/TagPill";
import { Footer } from "@/components/public/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getProjects } from "@/actions/projects";
import { getBlogPosts } from "@/actions/blog";
import { getSettings } from "@/actions/settings";
import { TrackedLink, TrackedAnchor } from "@/components/public/TrackedLink";
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ink/15 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3 md:px-12 lg:px-24">
          {/* Square logo mark */}
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center border border-forest bg-forest text-paper font-mono text-xs font-bold tracking-widest"
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
                  className="group flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-ink/55 transition-colors hover:text-forest"
                >
                  <span className="text-coral">{n}.</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Resume link + Theme toggle */}
          <div className="flex items-center gap-3">
            {profile?.resumeUrl && (
              <TrackedAnchor
                event="resume_downloaded"
                properties={{ source: "header" }}
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden border border-forest px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper sm:inline-flex"
              >
                Résumé
              </TrackedAnchor>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-screen-xl px-6 pt-16 md:px-12 lg:px-24">
        <div className="lg:flex lg:justify-between lg:gap-8">

          {/* ── LEFT PANEL (sticky) ── */}
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[42%] lg:flex-col lg:justify-between lg:py-24">
            <div>
              {/* Profile photo — square, forest border */}
              {profile?.photoUrl && (
                <div className="mb-8 h-16 w-16 overflow-hidden border border-ink/30">
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
                className="font-display text-4xl font-bold tracking-tight text-forest sm:text-5xl"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                {profile?.name ?? "Your Name"}
              </h1>

              {/* Role — medium weight */}
              <h2 className="mt-2 text-base font-medium tracking-tight text-ink/70">
                {profile?.role ?? "Software Engineer"}
              </h2>

              {/* Tagline */}
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
                {profile?.tagline ?? ""}
              </p>

              {/* Status badge */}
              <div className="mt-6 inline-flex items-center gap-2 border border-ink/15 px-3 py-1.5">
                <span className="h-2 w-2 bg-mint" />
                <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                  Open to interesting conversations
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
                  className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75 [&_a]:font-medium [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-coral [&_strong]:font-semibold [&_strong]:text-forest"
                  dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
              ) : (
                <p className="mt-6 text-sm text-ink/50">
                  Add your bio in the admin dashboard.
                </p>
              )}

              {profile?.resumeUrl && (
                <div className="mt-6">
                  <TrackedAnchor
                    event="resume_downloaded"
                    properties={{ source: "about_section" }}
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
                  >
                    View Full Résumé
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </TrackedAnchor>
                </div>
              )}
            </section>

            {/* Experience */}
            <section id="experience" className="mb-20 scroll-mt-20">
              <SectionLabel number="02" label="Experience" />

              {experiences.length > 0 ? (
                <ol className="mt-2 divide-y divide-ink/10">
                  {experiences.map((exp) => (
                    <li key={exp.id} className="py-1">
                      <ExperienceCard exp={exp} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-ink/40">No experience entries yet.</p>
              )}

              <div className="mt-8">
                <TrackedLink
                  event="view_all_clicked"
                  properties={{ section: "experience" }}
                  href="/archive"
                  className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
                >
                  View Full Archive
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </TrackedLink>
              </div>
            </section>

            {/* Projects */}
            <section id="projects" className="mb-20 scroll-mt-20">
              <SectionLabel number="03" label="Projects" />

              {projects.length > 0 ? (
                <ol className="mt-2 divide-y divide-ink/10">
                  {projects.map((project) => (
                    <li key={project.id} className="py-1">
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-ink/40">No projects yet.</p>
              )}

              <div className="mt-8">
                <TrackedLink
                  event="view_all_clicked"
                  properties={{ section: "projects" }}
                  href="/archive"
                  className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
                >
                  View Full Project Archive
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </TrackedLink>
              </div>
            </section>

            {/* Writing / Blog */}
            <section id="blog" className="mb-20 scroll-mt-20">
              <SectionLabel number="04" label="Writing" />

              {recentPosts.length > 0 ? (
                <ol className="mt-4 space-y-0 divide-y divide-ink/10">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <TrackedLink
                        event="blog_post_clicked"
                        properties={{
                          post_slug: post.slug,
                          post_title: post.title,
                          post_category: post.category,
                          source: "home",
                        }}
                        href={`/blog/${post.slug}`}
                        className="group block py-5 transition-colors hover:bg-forest/3"
                      >
                        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink/45">
                          {post.publishedAt ? formatDate(post.publishedAt) : ""}
                          {" · "}
                          <span>{post.category.toLowerCase()}</span>
                        </p>
                        <h3 className="font-semibold text-forest transition-colors group-hover:text-coral">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-1 text-sm text-ink/55 line-clamp-1">
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
                      </TrackedLink>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-sm text-ink/40">No posts published yet.</p>
              )}

              <div className="mt-8">
                <TrackedLink
                  event="view_all_clicked"
                  properties={{ section: "blog" }}
                  href="/blog"
                  className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
                >
                  View All Posts
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </TrackedLink>
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
        <span className="absolute left-0 top-0 h-full w-px bg-forest" />
        <span className="absolute left-0 top-0 h-px w-full bg-forest" />
      </div>
      <span className="font-mono text-[10px] text-coral">{number}.</span>
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-forest"
        style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}>
        {label}
      </h2>
      <span className="flex-1 border-t border-ink/15" />
    </div>
  );
}
