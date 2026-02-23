export function TagPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center border border-forest/25 bg-forest/7 px-2 py-0.5 text-[10px] font-medium uppercase leading-4 tracking-wider text-forest"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace", borderRadius: "2px" }}
    >
      {label}
    </span>
  );
}
