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
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
        {/* ── IDENTITY ── */}
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 pb-8 pt-12 sm:pt-16">
          <div className="flex items-center gap-5">
            {profile?.photoUrl && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-ink/30">
                <Image
                  src={profile.photoUrl}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                />
              </div>
            )}
            <div>
              <h1
                className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                <FlipName name={profile?.name ?? "Your Name"} />
              </h1>
              <p className="mt-1 text-base font-medium tracking-tight text-ink/70">
                {profile?.role ?? "Software Engineer"}
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-ink/60">{profile?.tagline ?? ""}</p>
            {profile?.socials && profile.socials.length > 0 && (
              <div className="mt-4">
                <SocialIcons socials={profile.socials} />
              </div>
            )}
          </div>
        </header>

        <main className="border-t border-ink/15 pb-20 pt-6">
          {experiences.length > 0 ? (
            <CareerMap experiences={experiences} />
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
