"use client";

import { useState } from "react";

export function FlipText({
  text,
  flippedText,
  className,
}: {
  text: string;
  flippedText: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        display: "inline-block",
        cursor: "default",
        transition: "transform 0.5s ease",
        transform: hovered ? "rotateY(360deg)" : "rotateY(0deg)",
      }}
    >
      {hovered ? flippedText : text}
    </span>
  );
}
