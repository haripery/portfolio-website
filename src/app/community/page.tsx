import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, Lightbulb, Trophy, ArrowRight, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommunityBooking } from "./CommunityBooking";

export const metadata: Metadata = {
  title: "Community -- Hariprasath Periyasamy",
  description:
    "Student mentoring, AI & technology workshops, and hackathon judging. Industry practitioner offering hands-on support to colleges, bootcamps, and tech communities.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/community`,
  },
};

const CREDENTIALS = [
  "10+ Years in Tech",
  "Shopify / Amazon / AWS",
  "ADPList Top 10 Mentor",
  "Northeastern MS",
];

const WORKSHOPS = [
  {
    name: "AI as Your Coding Partner",
    desc: "Using Claude, GitHub Copilot, and AI tools to learn faster and ship projects",
  },
  {
    name: "Harness Engineering",
    desc: "Writing effective prompts and integrating AI into real development workflows",
  },
  {
    name: "From Zero to Portfolio",
    desc: "Building a standout project portfolio using modern frontend + AI tools",
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen mosaic-bg text-forest">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <ThemeToggle />
        </div>

        {/* Header */}
        <h1
          className="text-3xl font-bold tracking-tight text-forest"
          style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
        >
          Community
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          I believe in giving back to the community that shaped my career. Whether
          you&apos;re a professor looking for an industry guest speaker, an
          organizer planning a hackathon, or a student who wants guidance -- I&apos;d
          love to help.
        </p>

        {/* Credibility strip */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          {CREDENTIALS.map((cred, i) => (
            <span key={cred} className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/45">
                {cred}
              </span>
              {i < CREDENTIALS.length - 1 && (
                <span className="text-ink/25">&middot;</span>
              )}
            </span>
          ))}
        </div>

        {/* ADPList Impact Badge */}
        <div className="mt-8">
          <Image
            src="https://adplist-users-production.s3.us-east-1.amazonaws.com/93bbf0f3c82d137ad508caddfa0aac88/swags/00fbf6d7-79ff-555e-bd85-0bfa2d186f3e.webp"
            alt="ADPList Mentoring Impact Badge"
            width={380}
            height={350}
            className="rounded-[14px]"
          />
        </div>

        {/* ── Student Mentoring ── */}
        <section id="mentoring" className="mt-16 scroll-mt-20">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-forest" strokeWidth={1.5} />
            <h2
              className="text-lg font-bold text-forest"
              style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
            >
              Student Mentoring
            </h2>
          </div>

          <ul className="mt-4 space-y-2">
            {[
              "One-on-one or small-group mentoring for CS and web development students",
              "Career guidance: resume reviews, mock interviews, navigating the tech job market",
              "Demystifying what it's like to work at companies like Amazon, Shopify, and AWS",
              "Available for ongoing mentoring or one-off sessions",
            ].map((item) => (
              <li
                key={item}
                className="text-sm leading-relaxed text-ink/65 before:mr-2 before:text-coral before:content-['·']"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* ADPList Booking Widget */}
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/45">
              Book a mentoring session
            </p>
            <CommunityBooking />
          </div>
        </section>

        {/* ── AI & Technology Workshops ── */}
        <section id="workshops" className="mt-16 scroll-mt-20">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-forest" strokeWidth={1.5} />
            <h2
              className="text-lg font-bold text-forest"
              style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
            >
              AI & Technology Workshops
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            {WORKSHOPS.map((w) => (
              <div key={w.name} className="border border-ink/15 bg-card p-4">
                <h3 className="text-sm font-bold text-forest">{w.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/60">{w.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-ink/55">
            Can be delivered as a single guest lecture, multi-session series, or hands-on lab.
          </p>

          <div className="mt-4">
            <a
              href="mailto:hariprasath.periyasamy@gmail.com?subject=Workshop%20Inquiry"
              className="group inline-flex items-center gap-2 border border-forest px-4 py-2 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
            >
              <Mail className="h-3 w-3" />
              Book a Workshop
            </a>
          </div>
        </section>

        {/* ── Hackathon Judging ── */}
        <section id="judging" className="mt-16 scroll-mt-20">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-forest" strokeWidth={1.5} />
            <h2
              className="text-lg font-bold text-forest"
              style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
            >
              Hackathon Judging
            </h2>
          </div>

          <ul className="mt-4 space-y-2">
            {[
              "Available to judge hackathons evaluating technical quality, creativity, and real-world impact",
              "Experience building full-stack AI apps, civic tech platforms, and distributed systems",
              "Can also serve as a hackathon mentor during the event",
            ].map((item) => (
              <li
                key={item}
                className="text-sm leading-relaxed text-ink/65 before:mr-2 before:text-coral before:content-['·']"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <a
              href="mailto:hariprasath.periyasamy@gmail.com?subject=Hackathon%20Judging%20Invitation"
              className="group inline-flex items-center gap-2 border border-forest px-4 py-2 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
            >
              <Mail className="h-3 w-3" />
              Invite Me to Judge
            </a>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 border-t border-ink/10 pt-8 text-center">
          <p className="text-sm text-ink/55">
            Have something else in mind? I&apos;m always open to interesting conversations.
          </p>
          <div className="mt-4">
            <a
              href="mailto:hariprasath.periyasamy@gmail.com"
              className="group inline-flex items-center gap-2 border border-forest px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
            >
              Get in Touch
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
