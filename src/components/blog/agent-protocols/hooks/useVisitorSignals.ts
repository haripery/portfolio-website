"use client";

import { useState, useEffect } from "react";
import type { VisitorSignals } from "@/lib/agents/tracker-agent";

const SESSION_KEY = "portfolio-pages-viewed";
const SESSION_START_KEY = "portfolio-session-start";

function getPagesViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function trackPageView(): void {
  if (typeof window === "undefined") return;
  const pages = getPagesViewed();
  const current = window.location.pathname;
  if (!pages.includes(current)) {
    pages.push(current);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(pages));
  }
}

function getSessionStart(): number {
  if (typeof window === "undefined") return Date.now();
  const stored = sessionStorage.getItem(SESSION_START_KEY);
  if (stored) return Number(stored);
  const now = Date.now();
  sessionStorage.setItem(SESSION_START_KEY, String(now));
  return now;
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getUTMParam(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? undefined;
}

export function useVisitorSignals(): VisitorSignals | null {
  const [signals, setSignals] = useState<VisitorSignals | null>(null);

  useEffect(() => {
    trackPageView();

    const sessionStart = getSessionStart();

    const collectSignals = (): VisitorSignals => ({
      referrer: document.referrer || "",
      pagesViewed: getPagesViewed(),
      timeOnSite: Math.round((Date.now() - sessionStart) / 1000),
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      browser: getBrowser(),
      scrollDepth: Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      ) || 0,
      utmSource: getUTMParam("utm_source"),
      utmMedium: getUTMParam("utm_medium"),
      utmCampaign: getUTMParam("utm_campaign"),
      currentPage: window.location.pathname,
      screenWidth: window.innerWidth,
    });

    setSignals(collectSignals());

    // Update scroll depth periodically
    const interval = setInterval(() => {
      setSignals(collectSignals());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return signals;
}
