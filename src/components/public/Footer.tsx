import { FlipText } from "./FlipText";

export function Footer({ text }: { text?: string | null }) {
  const defaultText =
    "Loosely designed in Figma and coded in VS Code. Built with Next.js and Tailwind CSS, deployed with Vercel.";

  return (
    <footer className="pb-16 pt-6 lg:pt-0 border-t border-ink/12">
      <p
        className="pt-6 text-[10px] text-ink/40 leading-relaxed"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        {text || defaultText}
      </p>
      <p
        className="mt-3 text-[10px] text-ink/30"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        <FlipText
          text="irah.dev"
          flippedText="hari.dev"
          className="text-coral/50 hover:text-coral transition-colors"
        />
      </p>
    </footer>
  );
}
