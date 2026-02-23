"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

export function TwitterEmbed() {
  useEffect(() => {
    // If the script is already loaded, just re-hydrate tweet blockquotes
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }

    // Otherwise load the script for the first time
    const existing = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]'
    );
    if (existing) {
      // Script tag exists but twttr not ready yet — wait for it
      existing.addEventListener("load", () => {
        window.twttr?.widgets.load();
      });
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        window.twttr?.widgets.load();
      };
      document.body.appendChild(script);
    }
  });

  return null;
}
