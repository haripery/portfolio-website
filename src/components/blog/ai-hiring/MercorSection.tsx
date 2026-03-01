"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { mercorTimeline } from "./data/chartData";

export function MercorSection() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Mercor: When the Interviewer Is the AI"
        id="mercor"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            Mercor takes the concept further than any traditional company. The interviewer itself is AI. Candidates complete a roughly 20-minute structured video interview where an AI generates questions based on their r&eacute;sum&eacute; and job description, transcribes responses in real time, and evaluates performance <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[13]</a>.
          </p>
        </div>
      </ScrollReveal>

      {/* Growth timeline */}
      <ScrollReveal>
        <div className="my-10 relative ml-4 border-l border-ink/15 pl-6">
          {mercorTimeline.map((item, i) => (
            <div key={i} className="relative mb-8 last:mb-0">
              <div className="absolute -left-[calc(1.5rem+4.5px)] top-1 h-2.5 w-2.5 border border-coral bg-card" style={{ borderRadius: "1px" }} />
              <p
                className="text-xs text-ink/50 mb-1"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {item.date}
              </p>
              <p className="text-sm text-ink/70">{item.event}</p>
              <p
                className="text-2xl font-bold text-coral mt-1"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            The growth numbers reflect how fast this model is gaining traction. Mercor raised $100 million at a $2 billion valuation in February 2025 <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[14]</a>, then hit a $10 billion valuation with a $350 million Series C just eight months later <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[15]</a>. It reached $100 million in annual recurring revenue in approximately 11 months <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[15]</a>. Its clients include OpenAI and Anthropic <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[15]</a>, the companies <em>building</em> the AI that&apos;s transforming hiring are themselves using AI-first hiring.
          </p>
          <p>
            Mercor&apos;s model is a one-and-done proposition for candidates: complete one AI interview per domain, and that recording becomes discoverable by multiple employers. The platform analyzes r&eacute;sum&eacute;s, GitHub profiles, interview transcripts, and publicly available data to build a comprehensive candidate profile <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[13]</a>. Employers search using natural language, something like &ldquo;React engineers with Node.js&rdquo; or &ldquo;Patent lawyers in Brazil,&rdquo; and Mercor&apos;s semantic engine returns ranked matches <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[13]</a>.
          </p>
          <p>
            The platform emphasizes that interview data isn&apos;t used to train third-party AI models and that users can request deletion <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[16]</a>. Candidates can retake interviews up to three times, and earlier attempts are not shared with employers <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[13]</a>.
          </p>
          <p>
            Mercor signals where hiring may be heading: away from repeated interview marathons with individual companies and toward portable, verified skill profiles that follow the candidate.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
