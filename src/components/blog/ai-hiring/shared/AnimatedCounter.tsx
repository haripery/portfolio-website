"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function AnimatedCounter({
  end,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const start = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isInView, end, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
