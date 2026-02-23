"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

interface BlogPostTrackerProps {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

export function BlogPostTracker({ slug, title, category, tags }: BlogPostTrackerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    posthog.capture("blog_post_viewed", {
      post_slug: slug,
      post_title: title,
      post_category: category,
      post_tags: tags,
    });
  }, [posthog, slug, title, category, tags]);

  return null;
}
