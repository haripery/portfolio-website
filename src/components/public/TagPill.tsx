export function TagPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center border border-[rgba(26,60,43,0.25)] bg-[rgba(26,60,43,0.07)] px-2 py-0.5 text-[10px] font-medium uppercase leading-4 tracking-wider text-[#1A3C2B]"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace", borderRadius: "2px" }}
    >
      {label}
    </span>
  );
}
