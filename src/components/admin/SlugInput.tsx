"use client";

import { useEffect } from "react";
import { slugify } from "@/lib/utils";

interface SlugInputProps {
  title: string;
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  basePath?: string;
}

export function SlugInput({
  title,
  value,
  onChange,
  disabled = false,
  basePath = "/blog/",
}: SlugInputProps) {
  // Auto-generate slug from title when the field is empty (new post only)
  useEffect(() => {
    if (!disabled && !value && title) {
      onChange(slugify(title));
    }
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink/75">Slug</label>
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-sm text-ink/45">{basePath}</span>
        <input
          type="text"
          value={value}
          onChange={(e) =>
            !disabled && onChange(slugify(e.target.value))
          }
          readOnly={disabled}
          className="flex-1 border border-ink/20 bg-card px-3 py-2 text-sm text-forest placeholder:text-ink/35 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default read-only:opacity-70"
          style={{ borderRadius: "2px" }}
          placeholder="my-post-slug"
        />
      </div>
      {disabled && (
        <p className="text-xs text-ink/45">
          Slug cannot be changed after publishing to avoid broken URLs.
        </p>
      )}
    </div>
  );
}
