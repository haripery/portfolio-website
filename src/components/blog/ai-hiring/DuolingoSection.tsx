"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";

export function DuolingoSection() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Duolingo: Same Policy, Different Backlash"
        id="duolingo"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            Duolingo adopted an almost identical policy to Shopify in April 2025. Headcount only increases if AI can&apos;t do the work, AI usage factors into performance reviews, and contractors are phased out for automatable tasks <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[17]</a>. CEO Luis von Ahn outlined the changes in an email to employees that he also posted on LinkedIn.
          </p>
          <p>
            But where Shopify&apos;s memo landed as forward-thinking, Duolingo&apos;s triggered a firestorm. The LinkedIn post attracted over 1,000 comments and 600 reposts, overwhelmingly negative <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[18]</a>. Customers threatened to delete the app. Former contractors revealed this wasn&apos;t new: Duolingo had already cut 10% of contract translators in late 2023 and another round of writers in 2024, replacing them with AI <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[19]</a>.
          </p>
        </div>
      </ScrollReveal>

      {/* Backlash vs Shopify comparison */}
      <ScrollReveal>
        <div className="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-mint/30 p-5">
            <p
              className="text-xs uppercase tracking-widest text-mint mb-2"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Shopify&apos;s Memo
            </p>
            <p className="text-sm font-medium text-forest mb-2">
              &ldquo;AI usage is now a baseline expectation&rdquo;
            </p>
            <p className="text-xs text-ink/50">
              Landed as forward-thinking. Framed as empowering teams. Strong revenue growth reinforced credibility.
            </p>
          </div>
          <div className="border border-coral/30 p-5">
            <p
              className="text-xs uppercase tracking-widest text-coral mb-2"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Duolingo&apos;s Memo
            </p>
            <p className="text-sm font-medium text-forest mb-2">
              Functionally identical policy
            </p>
            <p className="text-xs text-ink/50">
              1,000+ negative comments. Customers threatened to delete the app. History of contractor layoffs made it feel like displacement, not empowerment.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            The backlash intensified when von Ahn wrote the company would &ldquo;take occasional small hits on quality&rdquo; and &ldquo;move with urgency&rdquo; rather than wait for perfect technology <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[17]</a>. Duolingo responded by rolling out 148 AI-generated courses to demonstrate commitment, which only deepened skepticism <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[20]</a>.
          </p>
          <p>
            Von Ahn eventually walked it back. He told The New York Times in August 2025: <em>&ldquo;I did not give enough context. Internally, this was not controversial.&rdquo;</em> <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[21]</a> He also said that every tech company was taking the same approach, they just weren&apos;t being as open about it <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[21]</a>.
          </p>
          <p>
            The lesson isn&apos;t that the policy was wrong. It was functionally identical to Shopify&apos;s. The lesson is that communication matters, and every tech company is navigating this same tension between AI efficiency and human value. If you&apos;re interviewing at <em>any</em> mid-to-large tech company in 2026, assume AI fluency is being evaluated, even if no one says it out loud.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
