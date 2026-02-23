import { Heart } from "lucide-react";

const SUPPORT_LINKS = {
  github: "https://github.com/sponsors/haripery",
  buyMeACoffee: "https://buymeacoffee.com/haripery",
};

export function SupportBanner() {
  return (
    <section className="mt-14 rounded-lg border border-ink/15 bg-ink/[0.03] px-6 py-6 sm:px-8 sm:py-7">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/[0.06]">
          <Heart className="h-5 w-5 text-ink/40" />
        </span>
        <div>
          <h3
            className="text-base font-bold text-forest"
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            }}
          >
            Support independent writing
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">
            If this post was useful, consider supporting my open source work and
            independent writing.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 sm:ml-14">
        <a
          href={SUPPORT_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-wide text-forest transition-colors hover:border-forest hover:bg-forest hover:text-paper"
        >
          Sponsor on GitHub
        </a>
        <a
          href={SUPPORT_LINKS.buyMeACoffee}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-wide text-forest transition-colors hover:border-forest hover:bg-forest hover:text-paper"
        >
          Buy me a coffee
        </a>
      </div>
    </section>
  );
}
