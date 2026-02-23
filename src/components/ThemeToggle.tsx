"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";
import posthog from "posthog-js";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  return (
    <button
      onClick={() => {
        const next = isDark ? "light" : "dark";
        setTheme(next);
        posthog.capture("theme_toggled", { theme: next });
      }}
      className="flex h-8 w-8 items-center justify-center border border-forest/20 text-forest transition-colors hover:bg-forest/10"
      style={{ borderRadius: "2px" }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
