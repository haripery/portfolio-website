"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

const SOURCES = [
  {
    label: "AG-UI Specification",
    description: "Agent-User Interaction Protocol by CopilotKit",
    url: "https://docs.ag-ui.com",
  },
  {
    label: "A2A Protocol",
    description: "Agent-to-Agent Protocol by Google",
    url: "https://google.github.io/A2A",
  },
  {
    label: "A2UI Specification",
    description: "Agent-to-User Interface Protocol by Google",
    url: "https://google.github.io/A2UI",
  },
  {
    label: "Vercel AI SDK",
    description: "TypeScript toolkit for building AI applications",
    url: "https://sdk.vercel.ai",
  },
  {
    label: "MCP (Model Context Protocol)",
    description: "Agent-to-tool communication by Anthropic",
    url: "https://modelcontextprotocol.io",
  },
  {
    label: "Stack Overflow Developer Survey 2024",
    description: "76% of developers use or plan to use AI tools",
    url: "https://survey.stackoverflow.co/2024/ai",
  },
  {
    label: "MCP joins the Agentic AI Foundation",
    description: "97M+ monthly SDK downloads - Anthropic, Dec 2025",
    url: "https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation",
  },
  {
    label: "AI SDK 6 - Vercel Blog",
    description: "20M+ monthly downloads - Vercel, 2025",
    url: "https://vercel.com/blog/ai-sdk-6",
  },
  {
    label: "Does AI spell the death of front-end engineering?",
    description: "25% drop in frontend job posts - LeadDev / TalentNeuron",
    url: "https://leaddev.com/ai/does-ai-spell-death-front-end-engineering",
  },
];

export function SourcesSection() {
  return (
    <section id="sources" className="mb-8">
      <ScrollReveal>
        <span className="text-xs font-mono text-ink/30 tracking-wider uppercase">
          References
        </span>
        <h2 className="text-2xl font-bold text-ink mt-1 mb-6">
          Sources &amp; Specs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((source, i) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 rounded-lg border border-ink/15 hover:border-ink/30 bg-ink/[0.04] hover:bg-ink/[0.06] transition-all"
            >
              <span className="text-ink/20 group-hover:text-ink/40 font-mono text-xs mt-0.5">
                [{i + 1}]
              </span>
              <div>
                <span className="text-sm font-semibold text-ink group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {source.label}
                </span>
                <p className="text-xs text-ink/50 mt-0.5">
                  {source.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
