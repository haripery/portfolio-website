export function Footer({ text }: { text?: string | null }) {
  const defaultText =
    "Loosely designed in Figma and coded in VS Code. Built with Next.js and Tailwind CSS, deployed with Vercel.";

  return (
    <footer className="pb-16 pt-6 lg:pt-0">
      <p className="text-xs text-[#64748b] leading-relaxed">
        {text || defaultText}
      </p>
    </footer>
  );
}
