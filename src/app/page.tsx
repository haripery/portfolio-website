import { SocialIcons } from "@/components/public/SocialIcons";
import { CareerMap } from "@/components/public/CareerMap";
import { Footer } from "@/components/public/Footer";
import { FlipName } from "@/components/public/FlipName";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getSettings } from "@/actions/settings";
import { TrackedAnchor } from "@/components/public/TrackedLink";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Proof points under the home page summary
const FACTS = [
  "10+ years",
  "Autodesk · Shopify · AWS",
  "Led teams and engineering standards",
  "ADPList Top 10 mentor",
];

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const [profile, experiences, settings] = await Promise.all([
    getProfile(),
    getExperiences(),
    getSettings(),
  ]);

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const personJsonLd = profile
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        url: BASE_URL,
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
              { label: "Projects", href: "/archive" },
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
        <main className="pb-20 pt-10 sm:pt-14">
          {experiences.length > 0 ? (
            <CareerMap
              experiences={experiences}
              name={profile?.name ?? "Home"}
              summary={profile?.summary ?? ""}
              facts={FACTS}
              identity={
                <h1
                  className="flex flex-wrap items-center gap-x-2 text-[11px] uppercase tracking-widest text-ink/60"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  <FlipName name={profile?.name ?? "Your Name"} />
                  <span aria-hidden="true">·</span>
                  <span>{profile?.role ?? "Software Engineer"}</span>
                </h1>
              }
              socials={
                profile?.socials && profile.socials.length > 0 ? (
                  <SocialIcons socials={profile.socials} />
                ) : undefined
              }
            />
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
                View Full Résumé
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </TrackedAnchor>
            )}
            <TrackedAnchor
              event="resume_interactive_opened"
              properties={{ source: "home_footer" }}
              href="/resume"
              className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
            >
              Interactive Résumé
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </TrackedAnchor>
          </div>
        </main>

        <Footer text={settings?.footerText} />
      </div>
    </div>
  );
}
