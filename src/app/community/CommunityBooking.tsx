"use client";

export function CommunityBooking() {
  return (
    <div
      className="overflow-hidden border border-ink/15"
      style={{ borderRadius: 16, maxWidth: 650 }}
    >
      <iframe
        src="https://adplist.org/widgets/booking?src=hariprasath-periyasamy-hari"
        title="Book a mentoring session on ADPList"
        width="100%"
        height={496}
        loading="lazy"
        className="border-0"
      />
    </div>
  );
}
