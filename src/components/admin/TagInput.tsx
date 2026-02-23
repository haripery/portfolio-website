"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags (press Enter or comma)",
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim().replace(/,$/, "");
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className="flex flex-wrap gap-2 p-2 min-h-[44px] border border-ink/20 bg-card cursor-text focus-within:border-forest focus-within:ring-1 focus-within:ring-forest"
      style={{ borderRadius: "2px" }}
      onClick={() => document.getElementById("tag-input-internal")?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-forest/8 px-2.5 py-0.5 text-xs font-medium text-forest ring-1 ring-inset ring-forest/18"
          style={{ borderRadius: "2px" }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((t) => t !== tag));
            }}
            className="text-forest/50 hover:text-forest"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id="tag-input-internal"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-ink/35"
      />
    </div>
  );
}
