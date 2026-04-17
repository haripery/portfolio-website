"use client";

import { useState } from "react";

export function FlipName({ name }: { name: string }) {
  const [hovered, setHovered] = useState(false);

  // Split "Hari" from the rest of the name
  const hariIndex = name.indexOf("Hari");
  if (hariIndex === -1) return <>{name}</>;

  const before = name.slice(0, hariIndex);
  const after = name.slice(hariIndex + 4);

  return (
    <>
      {before}
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-block",
          cursor: "default",
          transition: "transform 0.5s ease",
          transform: hovered ? "rotateY(360deg)" : "rotateY(0deg)",
        }}
      >
        {hovered ? "iraH" : "Hari"}
      </span>
      {after}
    </>
  );
}
