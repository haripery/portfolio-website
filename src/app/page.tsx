import { SocialIcons } from "@/components/public/SocialIcons";
import { CareerMap, SectionHeading } from "@/components/public/CareerMap";
import { Footer } from "@/components/public/Footer";
import { FlipName } from "@/components/public/FlipName";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getSettings } from "@/actions/settings";
import { getBlogPosts } from "@/actions/blog";
import { formatDate } from "@/lib/utils";
import { TrackedAnchor, TrackedLink } from "@/components/public/TrackedLink";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Proof points under the home page summary
const FACTS = [
  "10+ years",
  "Autodesk · Shopify · AWS",
  "Architecture reviews with enterprise engineering teams",
  "Led teams and engineering standards",
  "ADPList Top 10 mentor",
];

// Posts chosen for the home page: the developer-facing ones first. Falls
// back to the newest posts for any slug that isn't published.
const HOME_POST_SLUGS = [
  "harness-engineering-with-claude-code",
  "agent-protocols-portfolio",
  "interview-loop-architecture",
];
const HOME_POST_NOTES: Record<string, string> = {
  "harness-engineering-with-claude-code": "Guide with an open-source reference implementation",
  "agent-protocols-portfolio": "Live demo on this site, running on Claude",
  "interview-loop-architecture": "Built for mentoring sessions",
};

const EDUCATION = [
  {
    title: "Master of Science in Informatics",
    place: "Northeastern University, Boston, MA",
    period: "Jan 2017 — Dec 2018",
  },
  {
    title: "ADPList Mentor",
    place: "Recognized as a Top 10 UX Engineering Mentor",
    period: "Community",
  },
];

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };

const FULL_NAME = "Hariprasath Periyasamy";
// The portfolio lives on irah.dev. NEXT_PUBLIC_APP_URL is the blog's domain,
// where "/" redirects to /blog, so share links must not be built from it.
const PORTFOLIO_URL = "https://www.irah.dev";

// What a shared link to the home page shows: title, description and (from
// opengraph-image.tsx) the card image.
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = `${FULL_NAME} · ${profile?.role ?? "Engineer"}`;
  const description =
    profile?.summary ||
    profile?.tagline ||
    "Full stack, all the way down. AI and cloud, all the way across.";
  return {
    metadataBase: new URL(PORTFOLIO_URL),
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      url: "/",
      siteName: "irah.dev",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const [profile, experiences, posts, settings] = await Promise.all([
    getProfile(),
    getExperiences(),
    getBlogPosts({ published: true }),
    getSettings(),
  ]);
  const chosen = HOME_POST_SLUGS.map((slug) => posts.find((post) => post.slug === slug)).filter(
    (post): post is (typeof posts)[number] => Boolean(post)
  );
  const recentPosts = [...chosen, ...posts.filter((post) => !chosen.includes(post))].slice(0, 3);

  const personJsonLd = profile
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        url: PORTFOLIO_URL,
        jobTitle: profile.role,
        description: profile.tagline,
        image: profile.photoUrl || undefined,
        sameAs: profile.socials?.filter((s) => s.url).map((s) => s.url) || [],
      }
    : null;

  return (
    <div className="relative min-h-screen mosaic-bg">
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}

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

          <ul className="hidden items-center gap-6 md:flex lg:gap-8">
            {[
              { label: "Writing", href: "/blog" },
              { label: "Community", href: "/community" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-mono text-xs uppercase tracking-widest text-ink/55 transition-colors hover:text-forest"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Resume link + Theme toggle */}
          <div className="flex items-center gap-3">
            <TrackedAnchor
              event="resume_interactive_opened"
              properties={{ source: "header" }}
              href="/resume"
              className="hidden border border-forest px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper sm:inline-flex"
            >
              Résumé
            </TrackedAnchor>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-screen-xl px-6 pt-16 md:px-12 lg:px-24">
        <main className="pb-20 pt-10 sm:pt-14">
          {experiences.length > 0 ? (
            <CareerMap
              experiences={experiences}
              name={profile?.name ?? "Home"}
              summary={profile?.summary ?? ""}
              facts={FACTS}
              identity={
                <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className="text-2xl font-bold leading-none tracking-tight text-forest sm:text-3xl"
                    style={DISPLAY}
                  >
                    <FlipName name={profile?.name ?? "Your Name"} />
                  </span>
                  <span className="text-xs uppercase tracking-widest text-ink/60 sm:text-sm" style={MONO}>
                    {profile?.role ?? "Software Engineer"}
                  </span>
                </h1>
              }
              socials={
                profile?.socials && profile.socials.length > 0 ? (
                  <SocialIcons socials={profile.socials} />
                ) : undefined
              }
            >
              <SectionHeading label="Education" />
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {EDUCATION.map((entry) => (
                  <li key={entry.title} className="border border-ink/15 bg-card p-6" style={{ borderRadius: 2 }}>
                    <p className="text-[10px] uppercase tracking-widest text-ink/55" style={MONO}>
                      {entry.period}
                    </p>
                    <p className="mt-2 text-xl font-bold leading-tight text-forest" style={DISPLAY}>
                      {entry.title}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">{entry.place}</p>
                  </li>
                ))}
              </ul>

              {recentPosts.length > 0 && (
                <>
                  <SectionHeading label="Writing">
                    <TrackedLink
                      event="view_all_clicked"
                      properties={{ section: "blog" }}
                      href="/blog"
                      className="group ml-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-forest transition-colors hover:text-coral"
                      style={MONO}
                    >
                      All posts
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </TrackedLink>
                  </SectionHeading>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                          className="group flex h-full flex-col border border-ink/15 bg-card p-6 transition-colors hover:border-gold"
                          style={{ borderRadius: 2 }}
                        >
                          <span className="text-[10px] uppercase tracking-widest text-ink/55" style={MONO}>
                            {post.publishedAt ? formatDate(post.publishedAt) : ""}
                            {" · "}
                            {post.category.toLowerCase()}
                          </span>
                          <span
                            className="mt-2 text-lg font-bold leading-snug text-forest transition-colors group-hover:text-coral"
                            style={DISPLAY}
                          >
                            {post.title}
                          </span>
                          {post.excerpt && (
                            <span className="mt-2 line-clamp-3 text-sm text-ink/60">{post.excerpt}</span>
                          )}
                          {HOME_POST_NOTES[post.slug] && (
                            <span className="mt-3 text-[10px] uppercase tracking-widest text-coral" style={MONO}>
                              {HOME_POST_NOTES[post.slug]}
                            </span>
                          )}
                        </TrackedLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CareerMap>
          ) : (
            <p className="mt-6 text-sm text-ink/40">No experience entries yet.</p>
          )}

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            {profile?.resumeUrl && (
              <TrackedAnchor
                event="resume_downloaded"
                properties={{ source: "home_footer" }}
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
              >
                Résumé PDF
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </TrackedAnchor>
            )}
          </div>
        </main>

        <Footer text={settings?.footerText} />
      </div>
    </div>
  );
}
