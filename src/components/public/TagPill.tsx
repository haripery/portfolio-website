export function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-[#5eead4] ring-1 ring-inset ring-teal-400/20">
      {label}
    </span>
  );
}
