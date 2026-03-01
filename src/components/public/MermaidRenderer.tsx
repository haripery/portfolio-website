"use client";

import { useEffect } from "react";

export function MermaidRenderer() {
  useEffect(() => {
    const renderMermaid = async () => {
      const mermaid = (await import("mermaid")).default;

      // Detect dark mode
      const isDark = document.documentElement.classList.contains("dark");

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        themeVariables: isDark
          ? {
              primaryColor: "#2d5a3f",
              primaryTextColor: "#E8F5ED",
              primaryBorderColor: "#4a7a5f",
              lineColor: "#808080",
              secondaryColor: "#1A1A1E",
              tertiaryColor: "#2a2a2e",
              noteBkgColor: "#2a2a2e",
              noteTextColor: "#E8F5ED",
              actorBkg: "#2d5a3f",
              actorTextColor: "#E8F5ED",
              actorLineColor: "#808080",
              signalColor: "#E8F5ED",
              signalTextColor: "#E8F5ED",
              labelBoxBkgColor: "#2a2a2e",
              labelBoxBorderColor: "#4a7a5f",
              labelTextColor: "#E8F5ED",
              loopTextColor: "#E8F5ED",
              activationBorderColor: "#4a7a5f",
              activationBkgColor: "#2d5a3f",
              sequenceNumberColor: "#E8F5ED",
            }
          : {
              primaryColor: "#e8f5ed",
              primaryTextColor: "#1A3C2B",
              primaryBorderColor: "#1A3C2B",
              lineColor: "#3A3A38",
              secondaryColor: "#f7f7f5",
              tertiaryColor: "#e8f5ed",
              noteBkgColor: "#fff3e0",
              noteTextColor: "#1A3C2B",
              actorBkg: "#e8f5ed",
              actorTextColor: "#1A3C2B",
              actorLineColor: "#3A3A38",
              signalColor: "#3A3A38",
              signalTextColor: "#1A3C2B",
              labelBoxBkgColor: "#f7f7f5",
              labelBoxBorderColor: "#1A3C2B",
              labelTextColor: "#1A3C2B",
              loopTextColor: "#1A3C2B",
              activationBorderColor: "#1A3C2B",
              activationBkgColor: "#e8f5ed",
              sequenceNumberColor: "#1A3C2B",
            },
        sequence: {
          actorMargin: 80,
          messageMargin: 40,
          boxMargin: 10,
          mirrorActors: false,
          useMaxWidth: true,
        },
        fontFamily:
          "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace",
        fontSize: 13,
      });

      // Find all mermaid code blocks within the prose content
      const container = document.querySelector(".prose");
      if (!container) return;

      const codeBlocks = container.querySelectorAll(
        'pre code.language-mermaid, pre > code[class*="language-mermaid"]'
      );

      for (let i = 0; i < codeBlocks.length; i++) {
        const codeEl = codeBlocks[i] as HTMLElement;
        const preEl = codeEl.parentElement;
        if (!preEl) continue;

        const graphDefinition = codeEl.textContent?.trim();
        if (!graphDefinition) continue;

        try {
          const { svg } = await mermaid.render(
            `mermaid-diagram-${i}`,
            graphDefinition
          );

          // Replace the <pre> block with the rendered SVG
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-diagram";
          wrapper.innerHTML = svg;
          preEl.replaceWith(wrapper);
        } catch {
          // Leave the code block as-is if rendering fails
        }
      }
    };

    renderMermaid();
  }, []);

  return null;
}
