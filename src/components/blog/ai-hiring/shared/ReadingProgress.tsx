"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress((window.scrollY / docHeight) * 100);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full">
      <div
        className="h-full bg-coral transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
