"use client";

import { motion } from "framer-motion";
import { Users, Lightbulb, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  { icon: Users, title: "Student Mentoring" },
  { icon: Lightbulb, title: "AI & Tech Workshops" },
  { icon: Trophy, title: "Hackathon Judging" },
];

export function CommunitySection() {
  return (
    <div className="mt-6">
      <p className="text-sm leading-relaxed text-ink/75">
        I believe in giving back to the community that shaped my career. Whether
        you&apos;re a professor looking for an industry guest speaker, an
        organizer planning a hackathon, or a student who wants guidance -- I&apos;d
        love to help.
      </p>

      {/* Compact service cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-3 border border-ink/15 bg-card p-4 transition-colors duration-200 hover:bg-forest/4"
          >
            <service.icon className="h-4 w-4 flex-shrink-0 text-forest" strokeWidth={1.5} />
            <span
              className="text-xs font-bold text-forest"
              style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
            >
              {service.title}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/community"
          className="group inline-flex items-center gap-2 border-b border-forest pb-0.5 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:border-coral hover:text-coral"
        >
          Learn More & Get in Touch
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
