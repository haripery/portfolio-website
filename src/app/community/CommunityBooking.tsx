"use client";

import { ArrowUpRight } from "lucide-react";

export function CommunityBooking() {
  return (
    <a
      href="https://adplist.org/mentors/hariprasath-periyasamy-hari"
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 border border-forest px-4 py-2 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
    >
      Book on ADPList
      <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}
