"use client";

import { ArrowUpRight } from "lucide-react";

const ADPLIST_URL =
  "https://adplist.org/mentors/hariprasath-periyasamy-hari";

export function CommunityBooking() {
  return (
    <>
      {/* Desktop: iframe embed */}
      <div
        className="hidden sm:block w-full overflow-hidden border border-ink/15"
        style={{ borderRadius: 16 }}
      >
        <iframe
          src="https://adplist.org/widgets/booking?src=hariprasath-periyasamy-hari"
          title="Book a mentoring session on ADPList"
          width="100%"
          height={550}
          loading="lazy"
          scrolling="no"
          className="border-0"
          style={{ overflow: "hidden" }}
        />
      </div>

      {/* Mobile: direct link */}
      <div className="sm:hidden">
        <a
          href={ADPLIST_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 border border-forest px-4 py-2 font-mono text-xs uppercase tracking-widest text-forest transition-colors hover:bg-forest hover:text-paper focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-paper"
        >
          Book on ADPList
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </>
  );
}
