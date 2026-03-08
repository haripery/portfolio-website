/**
 * Tracker Agent
 *
 * Collects and normalizes visitor signals into structured context.
 * Pure logic - no LLM calls.
 */

// ── Visitor Signals (raw from client) ────────────────────────────────────────

export interface VisitorSignals {
  referrer: string;
  pagesViewed: string[];
  timeOnSite: number;
  device: string;
  browser: string;
  scrollDepth: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  currentPage: string;
  screenWidth: number;
}

// ── Enriched Output ──────────────────────────────────────────────────────────

export interface EnrichedSignals {
  referrerCategory: ReferrerCategory;
  referrerDomain: string;
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  pagesViewed: string[];
  pageCategories: string[];
  timeOnSite: number;
  scrollDepth: number;
  engagementLevel: "low" | "medium" | "high";
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  currentPage: string;
}

export type ReferrerCategory =
  | "linkedin"
  | "github"
  | "google"
  | "twitter"
  | "hacker-news"
  | "reddit"
  | "direct"
  | "other";

// ── Tracker Logic ────────────────────────────────────────────────────────────

function classifyReferrer(referrer: string): {
  category: ReferrerCategory;
  domain: string;
} {
  if (!referrer || referrer === "")
    return { category: "direct", domain: "direct" };

  const lower = referrer.toLowerCase();
  let domain: string;
  try {
    domain = new URL(lower).hostname;
  } catch {
    domain = lower;
  }

  if (domain.includes("linkedin")) return { category: "linkedin", domain };
  if (domain.includes("github")) return { category: "github", domain };
  if (domain.includes("google") || domain.includes("bing"))
    return { category: "google", domain };
  if (domain.includes("twitter") || domain.includes("x.com"))
    return { category: "twitter", domain };
  if (domain.includes("news.ycombinator"))
    return { category: "hacker-news", domain };
  if (domain.includes("reddit")) return { category: "reddit", domain };

  return { category: "other", domain };
}

function classifyDevice(screenWidth: number): "mobile" | "tablet" | "desktop" {
  if (screenWidth < 768) return "mobile";
  if (screenWidth < 1024) return "tablet";
  return "desktop";
}

function classifyPageCategory(page: string): string {
  if (page.includes("blog")) return "blog";
  if (page.includes("project") || page.includes("archive")) return "projects";
  if (page.includes("experience") || page === "/") return "experience";
  return "general";
}

function classifyEngagement(
  timeOnSite: number,
  pagesViewed: number,
  scrollDepth: number
): "low" | "medium" | "high" {
  let score = 0;
  if (timeOnSite > 60) score++;
  if (timeOnSite > 180) score++;
  if (pagesViewed > 2) score++;
  if (pagesViewed > 4) score++;
  if (scrollDepth > 50) score++;
  if (scrollDepth > 80) score++;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

/**
 * Process raw visitor signals into enriched, structured context.
 */
export function processSignals(raw: VisitorSignals): EnrichedSignals {
  const { category: referrerCategory, domain: referrerDomain } =
    classifyReferrer(raw.referrer);

  return {
    referrerCategory,
    referrerDomain,
    deviceType: classifyDevice(raw.screenWidth),
    browser: raw.browser,
    pagesViewed: raw.pagesViewed,
    pageCategories: [
      ...new Set(raw.pagesViewed.map(classifyPageCategory)),
    ],
    timeOnSite: raw.timeOnSite,
    scrollDepth: raw.scrollDepth,
    engagementLevel: classifyEngagement(
      raw.timeOnSite,
      raw.pagesViewed.length,
      raw.scrollDepth
    ),
    utmSource: raw.utmSource,
    utmMedium: raw.utmMedium,
    utmCampaign: raw.utmCampaign,
    currentPage: raw.currentPage,
  };
}
