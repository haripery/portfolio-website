"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { canvaInterviewRounds } from "./data/chartData";
import { Check, X } from "lucide-react";

export function CanvaSection() {
  return (
    <section className="py-16">
      <SectionHeader
        title={`Canva: "Use AI in Our Interviews. We Insist."`}
        id="canva"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            In June 2025, Canva&apos;s head of platforms Simon Newton published a blog post that turned heads across the industry. The title was unambiguous: <em>&ldquo;Yes, you can use AI in our interviews. In fact, we insist.&rdquo;</em> [3]
          </p>
          <p>
            All Backend, Frontend, and Machine Learning engineering candidates at Canva are now <strong>expected</strong> to use AI coding tools during technical interviews. Not allowed. Not tolerated. Expected.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none mt-8">
          <h3>Why They Did It</h3>
          <p>
            Nearly half of Canva&apos;s frontend and backend engineers already use AI coding assistants daily [3]. The old interview format asked candidates to solve algorithm and data structure problems from scratch, which no longer reflected how engineers actually work at Canva. Newton wrote that asking candidates to solve problems without AI meant the company wasn&apos;t evaluating how they&apos;d actually perform on the job [3].
          </p>
          <p>
            There was also the cheating problem. Candidates were already covertly using AI during interviews through tools specifically designed to avoid detection. Rather than escalating into an arms race of policing, Canva chose transparency: bring AI into the open and evaluate how well candidates <em>collaborate</em> with it [3].
          </p>
        </div>
      </ScrollReveal>

      {/* Interview format comparison */}
      <ScrollReveal>
        <div className="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {canvaInterviewRounds.map((round) => (
            <div
              key={round.name}
              className={`border p-6 ${
                round.aiAllowed
                  ? "border-mint/30"
                  : "border-coral/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {round.aiAllowed ? (
                  <div className="flex items-center gap-1.5 text-mint">
                    <Check className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">AI Allowed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-coral">
                    <X className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">No AI</span>
                  </div>
                )}
              </div>
              <h4
                className="text-lg font-bold text-forest mb-1"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                {round.name}
              </h4>
              <p
                className="text-xs text-ink/50 mb-3"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {round.duration}
              </p>
              <p className="text-sm text-ink/60 leading-relaxed mb-3">
                {round.description}
              </p>
              <p className="text-xs text-ink/50">
                <strong className="text-forest">Tests:</strong> {round.tests}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <h3>What They Learned</h3>
          <p>
            The early results surfaced a clear pattern. Candidates with minimal AI experience didn&apos;t fail because they couldn&apos;t code. They failed because they lacked the judgment to guide AI effectively or recognize when its suggestions were suboptimal [3]. The most successful candidates used AI strategically for well-defined subtasks while maintaining control of the overall architecture, critically reviewed and improved AI-generated output, and demonstrated strong debugging skills when AI solutions had issues [3].
          </p>
          <p>
            Canva&apos;s initial experiments also confirmed what many suspected: AI tools can trivially solve traditional coding interview questions. Newton wrote that when the company tested its old Computer Science Fundamentals questions with AI tools, they produced correct, well-documented solutions in seconds, often without any follow-up prompts [3].
          </p>
          <p>
            Internal reaction was initially skeptical. Engineers worried about &ldquo;vibe coding sessions&rdquo; replacing rigorous fundamentals [6]. But Canva maintained that computer science depth is still evaluated, just in a different context. Candidates must take full ownership of all code produced, whether they wrote it or AI did [3].
          </p>
          <p>
            Canva&apos;s own research found that 65% of Australian job applicants were already using AI on r&eacute;sum&eacute;s, and 92% of Australian hiring managers were using AI in the process [7]. Their conclusion: the tools are everywhere, so the real skill worth testing is wielding them with judgment.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
