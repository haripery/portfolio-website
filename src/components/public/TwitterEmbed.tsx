"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
      ready: (cb: () => void) => void;
    };
  }
}

function loadTweets() {
  // Find the prose content container that holds the tweet blockquotes
  const container =
    document.querySelector(".prose") ?? document.body;
  window.twttr?.widgets.load(container as HTMLElement);
}

export function TwitterEmbed() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // If twttr is already fully initialised, just re-scan for new tweets
    if (window.twttr?.widgets) {
      loadTweets();
      return;
    }

    // Only inject the script tag once across all mounts
    if (scriptLoaded.current) return;

    const existing = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]'
    );

    if (!existing) {
      scriptLoaded.current = true;
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Poll briefly for window.twttr (widgets.js initialises asynchronously)
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.twttr?.widgets) {
        clearInterval(interval);
        loadTweets();
      } else if (attempts > 50) {
        // Give up after ~5 s
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []); // run once per mount

  return null;
}
