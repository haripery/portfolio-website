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
];

export function SourcesSection() {
  return (
    <section id="sources" className="mb-8">
      <ScrollReveal>
        <span className="text-xs font-mono text-[var(--ink)]/30 tracking-wider uppercase">
          References
        </span>
        <h2 className="text-2xl font-bold text-[var(--ink)] mt-1 mb-6">
          Sources &amp; Specs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((source, i) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 rounded-lg border border-[var(--ink)]/10 hover:border-[var(--ink)]/20 bg-[var(--ink)]/[0.02] hover:bg-[var(--ink)]/[0.04] transition-all"
            >
              <span className="text-[var(--ink)]/20 group-hover:text-[var(--ink)]/40 font-mono text-xs mt-0.5">
                [{i + 1}]
              </span>
              <div>
                <span className="text-sm font-semibold text-[var(--ink)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {source.label}
                </span>
                <p className="text-xs text-[var(--ink)]/50 mt-0.5">
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
