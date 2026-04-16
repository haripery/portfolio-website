"use client";

export function CommunityBooking() {
  return (
    <div
      className="w-full overflow-hidden border border-ink/15"
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
        style={{ overflow: "hidden", maxWidth: "100%" }}
      />
    </div>
  );
}
