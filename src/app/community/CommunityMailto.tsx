"use client";

import { Mail } from "lucide-react";

export function CommunityMailto({
  subject,
  label,
}: {
  subject?: string;
  label: string;
}) {
  const href = subject
    ? `mailto:hari@irah.dev?subject=${encodeURIComponent(subject)}`
    : "mailto:hari@irah.dev";

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
      className="group inline-flex items-center gap-2 border border-forest px-4 py-2 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
    >
      <Mail className="h-3 w-3" />
      {label}
    </a>
  );
}
