"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

interface BlogPostTrackerProps {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

export function BlogPostTracker({ slug, title, category, tags }: BlogPostTrackerProps) {
  useEffect(() => {
    if (!posthog.__loaded) return;

    posthog.capture("blog_post_viewed", {
      post_slug: slug,
      post_title: title,
      post_category: category,
      post_tags: tags,
    });
  }, [slug, title, category, tags]);

  return null;
}
