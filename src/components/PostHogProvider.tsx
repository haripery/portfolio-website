"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!KEY || posthog.__loaded) {
      setReady(true);
      return;
    }
    posthog.init(KEY, {
      api_host: HOST,
      person_profiles: "always",
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      loaded: () => setReady(true),
    });
  }, []);

  if (!ready) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
