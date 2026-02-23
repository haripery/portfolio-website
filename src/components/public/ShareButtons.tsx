"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import posthog from "posthog-js";

interface ShareButtonsProps {
  url: string;
  title: string;
  slug: string;
}

export function ShareButtons({ url, title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const track = (platform: string) => {
    posthog.capture("blog_post_shared", {
      platform,
      post_slug: slug,
      post_title: title,
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    track("copy_link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-4 border-t border-ink/10 pt-4 mt-2 mb-6">
      <span
        className="text-[10px] uppercase tracking-widest text-ink/40"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        Share
      </span>
      <div className="flex items-center gap-3">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("twitter")}
          className="text-ink/40 transition-colors hover:text-coral"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("linkedin")}
          className="text-ink/40 transition-colors hover:text-coral"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <button
          onClick={copyLink}
          className="text-ink/40 transition-colors hover:text-coral"
          aria-label={copied ? "Link copied" : "Copy link to clipboard"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-mint" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
