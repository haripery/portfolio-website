import type { ExperienceWithRelations } from "@/types";

export function ImpactSection({
  experiences,
}: {
  experiences: ExperienceWithRelations[];
}) {
  const rows = experiences.filter((exp) => exp.metrics.length > 0);
  if (rows.length === 0) return null;

  return (
    <ol className="mt-2 divide-y divide-ink/10">
      {rows.map((exp) => (
        <li key={exp.id} className="grid gap-3 p-4 sm:grid-cols-8 sm:gap-4">
          <p
            className="mt-1 text-[10px] uppercase tracking-widest text-ink/45 sm:col-span-2"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {exp.company}
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:col-span-6">
            {exp.metrics.map((metric) => (
              <li key={metric.id} className="min-w-0">
                <a href={`#exp-${exp.id}`} className="group block">
                  <span
                    className="block break-words text-2xl font-bold leading-tight tracking-tight text-forest underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-gold"
                    style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
                  >
                    {metric.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-ink/60">
                    {metric.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
