"use client";

import { motion } from "framer-motion";
import { Users, Lightbulb, Trophy, ArrowRight } from "lucide-react";
import Image from "next/image";

const SERVICES = [
  {
    icon: Users,
    title: "Student Mentoring",
    items: [
      "One-on-one or small-group mentoring for CS and web development students",
      "Career guidance: resume reviews, mock interviews, navigating the tech job market",
      "Demystifying what it's like to work at companies like Amazon, Shopify, and AWS",
      "Available for ongoing mentoring or one-off sessions",
    ],
    cta: "Request Mentoring",
  },
  {
    icon: Lightbulb,
    title: "AI & Technology Workshops",
    items: [
      '"AI as Your Coding Partner" -- Using Claude, GitHub Copilot, and AI tools to learn faster and ship projects',
      '"Harness Engineering" -- Writing effective prompts and integrating AI into real development workflows',
      '"From Zero to Portfolio" -- Building a standout project portfolio using modern frontend + AI tools',
      "Can be delivered as a single guest lecture, multi-session series, or hands-on lab",
    ],
    cta: "Book a Workshop",
  },
  {
    icon: Trophy,
    title: "Hackathon Judging",
    items: [
      "Available to judge hackathons evaluating technical quality, creativity, and real-world impact",
      "Experience building full-stack AI apps, civic tech platforms, and distributed systems",
      "Can also serve as a hackathon mentor during the event",
    ],
    cta: "Invite Me to Judge",
  },
];

const CREDENTIALS = [
  "10+ Years in Tech",
  "Shopify / Amazon / AWS",
  "ADPList Top 10 Mentor",
  "Northeastern MS",
];

export function CommunitySection() {
  return (
    <div className="mt-6">
      {/* Intro */}
      <p className="text-sm leading-relaxed text-ink/75">
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
              <span className="text-ink/25">·</span>
            )}
          </span>
        ))}
      </div>

      {/* ADPList Impact Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="mt-6"
      >
        <Image
          src="https://adplist-users-production.s3.us-east-1.amazonaws.com/93bbf0f3c82d137ad508caddfa0aac88/swags/00fbf6d7-79ff-555e-bd85-0bfa2d186f3e.webp"
          alt="ADPList Mentoring Impact Badge"
          width={380}
          height={350}
          className="rounded-[14px]"
        />
      </motion.div>

      {/* Service cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group border border-ink/15 bg-card p-5 transition-colors duration-200 hover:bg-forest/4"
          >
            {/* Icon */}
            <service.icon className="h-5 w-5 text-forest" strokeWidth={1.5} />

            {/* Title */}
            <h3
              className="mt-3 text-sm font-bold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              {service.title}
            </h3>

            {/* Description */}
            <ul className="mt-3 space-y-2">
              {service.items.map((item) => (
                <li
                  key={item}
                  className="text-xs leading-relaxed text-ink/60 before:mr-1.5 before:text-coral before:content-['·']"
                >
                  {item}
                </li>
              ))}
            </ul>

            {/* Card CTA */}
            <a
              href="mailto:hariprasath.periyasamy@gmail.com"
              className="mt-4 inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 font-mono text-[10px] uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
            >
              {service.cta}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 flex justify-center">
        <a
          href="mailto:hariprasath.periyasamy@gmail.com"
          className="inline-flex items-center gap-2 border border-forest px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
        >
          Get in Touch
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
