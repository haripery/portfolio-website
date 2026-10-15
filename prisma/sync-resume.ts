/**
 * Sync profile, experience and the featured project with the current résumé.
 *
 *   npx tsx prisma/sync-resume.ts            # dry run: print the planned changes
 *   npx tsx prisma/sync-resume.ts --apply    # write them
 *   npx tsx prisma/sync-resume.ts --apply --prune   # also delete unmatched experiences
 *
 * This file is the source of truth for résumé content. Edit it, re-run it.
 * The production home page has not been refreshing its cache on its own, so
 * redeploy after applying if the change does not show up.
 * It never touches blog posts, comments, users, settings or socials.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");
const PRUNE = process.argv.includes("--prune");

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const PROFILE = {
  role: "Principal Engineer",
  // Shown under the home page headline
  summary:
    "Ten-plus years of full-stack engineering, frontend-heavy, building the web applications customers use across enterprise SaaS, cloud observability, ad tech and banking. Now focused on applied AI: governed, human-in-the-loop agents and the interfaces people use to trust them.",
  tagline:
    "I build AI-native products and governed, human-in-the-loop agents — and explore what it means to build near the singularity.",
  bio: [
    "<p>Principal Engineer with <strong>10+ years</strong> of experience building high-performance, customer-centric web applications across enterprise SaaS, cloud observability, ad tech, and banking.</p>",
    "<p>Deep full-stack expertise in React, TypeScript, Node.js, GraphQL, and AWS, now focused on <strong>applied AI</strong>: governed, human-in-the-loop agents, MCP-based tooling, and AI-native engineering workflows.</p>",
    "<p>Proven track record of leading cross-functional delivery, raising engineering standards across teams, and mentoring engineers.</p>",
  ].join("\n"),
  resumeUrl: "https://www.irah.dev/Hariprasath_Periyasamy_Resume.pdf",
};

type ExperienceContent = {
  /** Lowercase alphanumeric fragments; an existing row matches if its company contains one */
  match: string[];
  period: string;
  title: string;
  company: string;
  companyUrl: string;
  description: string;
  tags: string[];
  links: { label: string; url: string }[];
  metrics: { value: string; label: string }[];
};

const bullets = (items: string[]) =>
  `<ul>\n${items.map((item) => `  <li>${item}</li>`).join("\n")}\n</ul>`;

// Newest first; array order becomes sortOrder.
const EXPERIENCES: ExperienceContent[] = [
  {
    match: ["autodesk"],
    period: "May 2026 — Present",
    title: "Principal Engineer",
    company: "Autodesk",
    companyUrl: "https://www.autodesk.com",
    description:
      "<p><strong>Post-Purchase – Autodesk Account Subscriptions &amp; Billing</strong></p>\n" +
      bullets([
        "As lead frontend engineer, own Autodesk’s personalized, AI-driven billing website, used by <strong>thousands of customers daily</strong>, and led frontend delivery of the flagship Account Subscriptions 3.0 redesign.",
        "Originated a human-supervised AI on-call triage assistant that finds the failing layer and its owner, and took it through enterprise AI governance, security review, and AWS deployment with <strong>1,200+ automated tests</strong>.",
        "Documented the enterprise approval path for AI services so the next service owner can repeat it, lowering the barrier to shipping governed AI at Autodesk.",
        "Launched an AI adoption forum across <strong>three teams</strong>, turning demos into a prioritized, owned backlog, and standardized a 10-server MCP tool stack and reusable agent skills.",
        "Authored engineering standards and architecture proposals, including a UI readiness framework and a distributed tracing initiative, to raise quality across teams.",
        "Strengthened the shared design system so product copy and visual changes ship without a package release, and built components for reuse by sister teams.",
      ]),
    tags: ["Applied AI", "Leadership", "Reliability", "Design Systems", "MCP", "AI Governance"],
    links: [
      { label: "Triage assistant case study", url: "https://www.irah.dev/resume#case-study" },
    ],
    metrics: [
      { value: "Thousands", label: "of customers use the AI-driven billing website daily" },
      { value: "1,200+", label: "automated tests behind the AI on-call triage assistant" },
      { value: "Enterprise", label: "approval path for AI services, documented so other teams can repeat it" },
      { value: "3 teams", label: "in the AI adoption forum, from demos to an owned backlog" },
    ],
  },
  {
    match: ["shopify"],
    period: "Aug 2025 — May 2026",
    title: "Senior Engineer",
    company: "Shopify",
    companyUrl: "https://www.shopify.com",
    description: bullets([
      "Led engineering for the Ads 3P team (real-time bidding, merchant dashboards, email/SMS automations), combining hands-on leadership with mentoring on frontend architecture, code quality, and delivery velocity.",
      "Built a high-integrity event tracking solution across Web and Native platforms, ensuring reliable real-time signals for Meta Pixel and Google Tag Manager to improve merchant conversion tracking accuracy.",
      "Developed a Dynamic Creative Optimization (DCO) system spanning frontend and backend layers, serving ad creatives within <strong>150ms</strong> response time with full-stack ownership from UI rendering to data layer integration.",
      "Contributed to the on-call rotation (weekly quarterly shifts), driving system health, security hardening, and engineering culture through structured code reviews and knowledge-sharing sessions.",
    ]),
    tags: ["Leadership", "Performance", "Reliability", "Ads", "DCO", "Meta Pixel"],
    links: [],
    metrics: [
      { value: "≤150ms", label: "response time serving ad creatives in the DCO system" },
      { value: "Ads 3P", label: "team led across real-time bidding, merchant dashboards, and email/SMS" },
    ],
  },
  {
    match: ["amazon", "aws"],
    period: "Jun 2022 — Aug 2025",
    title: "Senior Engineer",
    company: "Amazon Web Services",
    companyUrl: "https://aws.amazon.com",
    description:
      "<p><strong>Amazon Ads – Full-Stack Digital Experiences</strong></p>\n" +
      bullets([
        "Designed and shipped Ads Data Manager, a cloud-based data onboarding and activation SPA using React, TypeScript, and GraphQL, delivering production-ready digital workflows for enterprise advertisers.",
        "Implemented Backend-for-Frontend (BFF) middleware using GraphQL to stitch multiple microservice APIs, optimizing client-server communication and streamlining complex advertiser data flows.",
        "Achieved a <strong>60% reduction</strong> in backend API calls through GraphQL query batching and multi-level caching (client, CDN), reducing average response time from <strong>850ms to 320ms</strong> under peak traffic.",
        "Developed a Server-Driven UI architecture that delivered UI configurations from the backend, enabling real-time interface updates without client deployments and supporting A/B experimentation at scale.",
        "Built a stream-based data ingestion interface enabling advertisers to upload and process large datasets via chunked streaming, improving performance and memory efficiency for high-volume workflows.",
        "Led infrastructure provisioning with AWS CDK for secure self-service deployments across multiple accounts and regions, reducing deployment complexity and accelerating release cycles.",
      ]) +
      "\n<p><strong>AWS CloudWatch – Real-Time Monitoring &amp; Observability</strong></p>\n" +
      bullets([
        "Engineered AI-powered anomaly detection dashboards that transformed complex ML outputs into intuitive visualizations and interactive tables, enabling non-technical users to identify log pattern anomalies.",
        "Built a high-performance CloudWatch LiveTail system using WebSocket architecture and Web Workers, delivering real-time log streaming at <strong>10,000+ events/second</strong> while maintaining a responsive UI.",
        "Implemented an extensive telemetry system capturing client-side latency, API errors, and behavioral metrics to enable deep performance analysis and data-driven product decisions.",
      ]),
    tags: ["Applied AI", "Performance", "Reliability", "React", "TypeScript", "GraphQL", "AWS CDK", "WebSockets"],
    links: [
      { label: "Ads Data Manager", url: "https://advertising.amazon.com/resources/whats-new/ads-data-manager-beta" },
      { label: "Anomaly detection", url: "https://aws.amazon.com/blogs/aws/amazon-cloudwatch-logs-now-offers-automated-pattern-analytics-and-anomaly-detection/" },
      { label: "CloudWatch LiveTail", url: "https://aws.amazon.com/blogs/mt/announcing-live-tail-feature-for-amazon-cloudwatch-logs/" },
    ],
    metrics: [
      { value: "60%", label: "fewer backend API calls via GraphQL batching and caching" },
      { value: "850→320ms", label: "average response time under peak traffic" },
      { value: "10,000+/s", label: "log events streamed live in CloudWatch LiveTail" },
    ],
  },
  {
    match: ["sumo"],
    period: "Sep 2021 — May 2022",
    title: "Senior Frontend Engineer",
    company: "Sumo Logic",
    companyUrl: "https://www.sumologic.com",
    description: bullets([
      "Led development of high-performance data analytics dashboards with a focus on rapid prototyping, iterative delivery, and cross-functional collaboration with product and design stakeholders.",
      "Detected and resolved JavaScript memory leaks in large-scale data visualization components using Chrome DevTools, reducing memory consumption by <strong>25%</strong>.",
      "Established a comprehensive design system using Atomic Design principles, enabling faster prototyping and consistent user experiences across the product suite.",
      "Improved dashboard load times by <strong>45%</strong> through tree shaking, lazy loading, and performance monitoring with well-defined SLIs.",
    ]),
    tags: ["Leadership", "Performance", "Design Systems", "Dashboards"],
    links: [{ label: "Demo", url: "https://www.youtube.com/watch?v=A-O_E-NbxN8" }],
    metrics: [
      { value: "45%", label: "shorter dashboard load times" },
      { value: "25%", label: "less memory in large-scale data visualizations" },
    ],
  },
  {
    match: ["dassault", "3ds"],
    period: "Jan 2019 — Aug 2021",
    title: "R&D Software Engineer",
    company: "Dassault Systèmes",
    companyUrl: "https://www.3ds.com",
    description: bullets([
      "Designed, developed, and maintained a Web UI Template library for xApps (online CAD applications), creating reusable components consumed by all feature teams <strong>company-wide</strong>.",
      "Ensured full cross-platform compatibility for mobile and touch device workflows, delivering seamless user experiences across devices.",
      "Optimized network performance through resource hinting, tree shaking, compression, and caching; enhanced runtime efficiency with Web Workers and LocalStorage strategies.",
    ]),
    tags: ["Performance", "Design Systems", "Web Workers", "Mobile & Touch"],
    links: [{ label: "Demo", url: "https://www.youtube.com/watch?v=2pTUcYrXV-Y" }],
    metrics: [
      { value: "Company-wide", label: "Web UI template library used by every feature team" },
    ],
  },
  {
    match: ["cognizant"],
    period: "Jul 2014 — Nov 2016",
    title: "Programmer Analyst",
    company: "Cognizant Technology Solutions",
    companyUrl: "https://www.cognizant.com",
    description: bullets([
      "Enhanced digital banking payment platforms, including Lloyds Bank Commercial Banking Online, with responsive, cross-browser, and accessibility-compliant interfaces for major financial services clients.",
      "Designed and implemented a test automation framework across Chrome and Firefox, reducing manual testing efforts by <strong>25%</strong> and streamlining QA workflows.",
    ]),
    tags: ["Accessibility", "Test Automation", "Banking"],
    links: [
      { label: "Lloyds Commercial Banking Online", url: "https://cbonline.lloydsbank.com/" },
    ],
    metrics: [
      { value: "25%", label: "less manual testing from a test automation framework" },
    ],
  },
];

// Home page career map: one headline per company, and the highlights a visitor
// can zoom into. Keyed by the company name used in EXPERIENCES. Paragraphs in
// `detail` are separated by a blank line.
const HIGHLIGHTS: Record<
  string,
  {
    headline: string;
    /** icon: a key from src/components/public/highlightIcons.tsx; viz: a spec read by HighlightViz */
    /** areas: which parts of the T it belongs to — "fullstack", "ai", "cloud", comma-separated */
    items: {
      kind: string;
      title: string;
      icon?: string;
      viz?: string;
      areas?: string;
      /** Demo or reference link from the résumé */
      link?: { label: string; url: string };
      detail: string[];
    }[];
  }
> = {
  Autodesk: {
    headline:
      "A personalized, AI-assisted website for customers, and a read-only, human-supervised on-call triage assistant for the teams behind it.",
    items: [
      {
        kind: "For customers",
        title: "Personalized, AI-assisted account and billing website",
        areas: "fullstack,ai",
        icon: "users",
        viz: "crowd:Thousands:of customers use it every day",
        detail: [
          "As lead frontend engineer, own Autodesk’s personalized, AI-driven billing website, used by thousands of customers daily, and led frontend delivery of the flagship Account Subscriptions 3.0 redesign.",
        ],
      },
      {
        kind: "For internal teams and stakeholders",
        title: "AI on-call triage assistant",
        link: { label: "Case study", url: "https://www.irah.dev/resume#case-study" },
        areas: "ai,fullstack,cloud",
        icon: "bot",
        viz: "flow:An alert fires^on a production service|Triage agent^LangGraph · Amazon Bedrock · MCP|Read-only queries^allow-listed integrations into observability and source control, grounded in a knowledge graph|Layer and owner^which layer failed, which team owns it|Engineer reviews^nothing is remediated automatically",
        detail: [
          "Originated a human-supervised AI on-call triage assistant that finds the failing layer and its owner, and took it through enterprise AI governance, security review, and AWS deployment.",
          "It works read-only through allow-listed integrations, never remediates on its own, and an engineer reviews every action.",
          "Built in Python with LangGraph on Amazon Bedrock and MCP. It queries observability and source-control systems through allow-listed integrations, grounded in a knowledge graph of team knowledge, and an eval harness checks for measurable, grounded answers.",
        ],
      },
      {
        kind: "Across teams",
        title: "AI adoption forum, a shared MCP stack and a documented approval path",
        areas: "ai",
        icon: "network",
        viz: "tags:AI adoption forum across three teams|Prioritized, owned backlog|10-server MCP tool stack|Reusable agent skills|Documented approval path for AI services",
        detail: [
          "Launched an AI adoption forum across three teams, turning demos into a prioritized, owned backlog, and standardized a 10-server MCP tool stack and reusable agent skills.",
          "Documented the enterprise approval path for AI services so the next service owner can repeat it, lowering the barrier to shipping governed AI at Autodesk.",
        ],
      },
      {
        kind: "Engineering quality",
        title: "Standards, architecture proposals and the design system",
        areas: "fullstack",
        icon: "ruler",
        viz: "tags:UI readiness framework|Distributed tracing|Shared design system|Reusable components",
        detail: [
          "Authored engineering standards and architecture proposals, including a UI readiness framework and a distributed tracing initiative, to raise quality across teams.",
          "Strengthened the shared design system so product copy and visual changes ship without a package release, and built components for reuse by sister teams.",
        ],
      },
    ],
  },
  Shopify: {
    headline:
      "Led the Ads 3P team; architecture reviews with Microsoft and Instacart engineering teams; ad creatives in under 150ms.",
    items: [
      {
        kind: "External engineering teams",
        title: "Architecture reviews with Microsoft and Instacart on real-time bidding",
        areas: "fullstack",
        icon: "handshake",
        viz: "steps:Microsoft and Instacart engineering teams|Architecture reviews on real-time bidding|Better creatives that load faster",
        detail: [
          "Ran architecture reviews with Microsoft’s and Instacart’s engineering teams on Shopify’s real-time bidding systems.",
          "The reviews led to better-designed ad creatives that load faster.",
        ],
      },
      {
        kind: "Leadership",
        title: "Led engineering for the Ads 3P team",
        areas: "fullstack",
        icon: "megaphone",
        viz: "tags:Real-time bidding|Merchant dashboards|Email and SMS automations",
        detail: [
          "Led engineering for the Ads 3P team (real-time bidding, merchant dashboards, email/SMS automations), combining hands-on leadership with mentoring on frontend architecture, code quality, and delivery velocity.",
        ],
      },
      {
        kind: "Performance",
        title: "Dynamic Creative Optimization within 150ms",
        areas: "fullstack",
        icon: "zap",
        viz: "stat:≤150ms:to serve an ad creative",
        detail: [
          "Developed a Dynamic Creative Optimization (DCO) system spanning frontend and backend layers, serving ad creatives within 150ms response time with full-stack ownership from UI rendering to data layer integration.",
        ],
      },
      {
        kind: "Data integrity",
        title: "Event tracking across Web and Native",
        areas: "fullstack",
        icon: "activity",
        viz: "steps:Web and Native events|Reliable real-time signals|Meta Pixel and Google Tag Manager",
        detail: [
          "Built a high-integrity event tracking solution across Web and Native platforms, ensuring reliable real-time signals for Meta Pixel and Google Tag Manager to improve merchant conversion tracking accuracy.",
        ],
      },
      {
        kind: "Reliability",
        title: "On-call and engineering culture",
        areas: "cloud",
        icon: "shield",
        viz: "tags:System health|Security hardening|Code reviews|Knowledge sharing",
        detail: [
          "Contributed to the on-call rotation (weekly quarterly shifts), driving system health, security hardening, and engineering culture through structured code reviews and knowledge-sharing sessions.",
        ],
      },
    ],
  },
  "Amazon Web Services": {
    headline: "Ads Data Manager and CloudWatch LiveTail, with 60% fewer API calls.",
    items: [
      {
        kind: "Amazon Ads",
        title: "Designed and shipped Ads Data Manager",
        link: { label: "Ads Data Manager announcement", url: "https://advertising.amazon.com/resources/whats-new/ads-data-manager-beta" },
        areas: "fullstack,cloud",
        icon: "database",
        viz: "steps:Onboard advertiser data|Activate it|Change the UI without a client deploy",
        detail: [
          "Designed and shipped Ads Data Manager, a cloud-based data onboarding and activation SPA using React, TypeScript, and GraphQL, delivering production-ready digital workflows for enterprise advertisers.",
          "Developed a Server-Driven UI architecture that delivered UI configurations from the backend, enabling real-time interface updates without client deployments and supporting A/B experimentation at scale.",
          "Led infrastructure provisioning with AWS CDK for secure self-service deployments across multiple accounts and regions, reducing deployment complexity and accelerating release cycles.",
        ],
      },
      {
        kind: "Performance",
        title: "GraphQL batching and caching: 60% fewer calls, 850→320ms",
        areas: "fullstack",
        icon: "gauge",
        viz: "drop:850:320:ms:average response time under peak traffic",
        detail: [
          "Achieved a 60% reduction in backend API calls through GraphQL query batching and multi-level caching (client, CDN), reducing average response time from 850ms to 320ms under peak traffic.",
          "Implemented Backend-for-Frontend (BFF) middleware using GraphQL to stitch multiple microservice APIs, optimizing client-server communication and streamlining complex advertiser data flows.",
        ],
      },
      {
        kind: "AWS CloudWatch",
        title: "LiveTail: 10,000+ log events a second",
        link: { label: "AWS blog: Live Tail", url: "https://aws.amazon.com/blogs/mt/announcing-live-tail-feature-for-amazon-cloudwatch-logs/" },
        areas: "fullstack,cloud",
        icon: "radio",
        viz: "stream:10000:log events a second, streamed live",
        detail: [
          "Built a high-performance CloudWatch LiveTail system using WebSocket architecture and Web Workers, delivering real-time log streaming at 10,000+ events/second while maintaining a responsive UI.",
        ],
      },
      {
        kind: "AWS CloudWatch",
        title: "AI-powered anomaly detection dashboards",
        link: { label: "AWS blog: anomaly detection", url: "https://aws.amazon.com/blogs/aws/amazon-cloudwatch-logs-now-offers-automated-pattern-analytics-and-anomaly-detection/" },
        areas: "ai,cloud",
        icon: "brain",
        viz: "anomaly:Log pattern anomalies, picked out for non-technical users",
        detail: [
          "Engineered AI-powered anomaly detection dashboards that transformed complex ML outputs into intuitive visualizations and interactive tables, enabling non-technical users to identify log pattern anomalies.",
          "Implemented an extensive telemetry system capturing client-side latency, API errors, and behavioral metrics to enable deep performance analysis and data-driven product decisions.",
        ],
      },
    ],
  },
  "Sumo Logic": {
    headline: "Dashboards that load 45% faster on 25% less memory.",
    items: [
      {
        kind: "Performance",
        title: "45% shorter dashboard load times",
        areas: "fullstack",
        icon: "gauge",
        viz: "percent:45:shorter dashboard load times",
        detail: [
          "Improved dashboard load times by 45% through tree shaking, lazy loading, and performance monitoring with well-defined SLIs.",
        ],
      },
      {
        kind: "Performance",
        title: "25% less memory in data visualizations",
        areas: "fullstack",
        icon: "memory",
        viz: "percent:25:less memory in data visualizations",
        detail: [
          "Detected and resolved JavaScript memory leaks in large-scale data visualization components using Chrome DevTools, reducing memory consumption by 25%.",
        ],
      },
      {
        kind: "Design systems",
        title: "A design system built on Atomic Design",
        link: { label: "Dashboard demo video", url: "https://www.youtube.com/watch?v=A-O_E-NbxN8" },
        areas: "fullstack",
        icon: "component",
        viz: "steps:Atoms|Molecules|Organisms|Templates|Pages",
        detail: [
          "Established a comprehensive design system using Atomic Design principles, enabling faster prototyping and consistent user experiences across the product suite.",
          "Led development of high-performance data analytics dashboards with a focus on rapid prototyping, iterative delivery, and cross-functional collaboration with product and design stakeholders.",
        ],
      },
    ],
  },
  "Dassault Systèmes": {
    headline: "The Web UI library every feature team built on.",
    items: [
      {
        kind: "Design systems",
        title: "Company-wide Web UI template library",
        link: { label: "Demo video", url: "https://www.youtube.com/watch?v=2pTUcYrXV-Y" },
        areas: "fullstack",
        icon: "component",
        viz: "crowd:Company-wide:every feature team built on one Web UI library",
        detail: [
          "Designed, developed, and maintained a Web UI Template library for xApps (online CAD applications), creating reusable components consumed by all feature teams company-wide.",
        ],
      },
      {
        kind: "Platforms",
        title: "Mobile and touch workflows",
        areas: "fullstack",
        icon: "smartphone",
        viz: "devices:Phone|Tablet|Desktop",
        detail: [
          "Ensured full cross-platform compatibility for mobile and touch device workflows, delivering seamless user experiences across devices.",
        ],
      },
      {
        kind: "Performance",
        title: "Network and runtime performance",
        areas: "fullstack",
        icon: "zap",
        viz: "tags:Resource hinting|Tree shaking|Compression|Caching|Web Workers|LocalStorage",
        detail: [
          "Optimized network performance through resource hinting, tree shaking, compression, and caching; enhanced runtime efficiency with Web Workers and LocalStorage strategies.",
        ],
      },
    ],
  },
  "Cognizant Technology Solutions": {
    headline: "Banking interfaces for Lloyds, and 25% less manual testing.",
    items: [
      {
        kind: "Banking",
        title: "Lloyds Bank Commercial Banking Online",
        link: { label: "Lloyds Commercial Banking Online", url: "https://cbonline.lloydsbank.com/" },
        areas: "fullstack",
        icon: "landmark",
        viz: "tags:Responsive|Cross-browser|Accessibility-compliant",
        detail: [
          "Enhanced digital banking payment platforms, including Lloyds Bank Commercial Banking Online, with responsive, cross-browser, and accessibility-compliant interfaces for major financial services clients.",
        ],
      },
      {
        kind: "Quality",
        title: "Test automation framework",
        areas: "fullstack",
        icon: "flask",
        viz: "percent:25:less manual testing",
        detail: [
          "Designed and implemented a test automation framework across Chrome and Firefox, reducing manual testing efforts by 25% and streamlining QA workflows.",
        ],
      },
    ],
  },
};

// Matched by title.
const PROJECT = {
  title: "On-Call Triage Assistant",
  description:
    "<p>A human-supervised AI assistant that investigates on-call alerts and reports <strong>which layer failed and which team owns it</strong>, instead of summarizing the alert. Originated at Autodesk and taken through enterprise AI governance, security review, and AWS deployment. It works read-only through allow-listed integrations, never remediates on its own, and an engineer reviews every action.</p>",
  url: "https://www.irah.dev/resume#case-study",
  stats: "1,200+ automated tests",
  featured: true,
  tags: ["Python", "LangGraph", "Amazon Bedrock", "MCP"],
};

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const clip = (value: unknown) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const flat = text.replace(/\s+/g, " ");
  return flat.length > 110 ? `${flat.slice(0, 110)}… (${flat.length} chars)` : flat;
};

/** Returns the fields whose current value differs from the wanted one. */
function diff(current: Record<string, unknown>, wanted: Record<string, unknown>) {
  return Object.keys(wanted).filter(
    (key) => JSON.stringify(current[key]) !== JSON.stringify(wanted[key])
  );
}

function report(heading: string, current: Record<string, unknown>, wanted: Record<string, unknown>, changed: string[]) {
  if (changed.length === 0) {
    console.log(`  = ${heading}: no changes`);
    return;
  }
  console.log(`  ~ ${heading}`);
  for (const key of changed) {
    console.log(`      ${key}:`);
    console.log(`        - ${clip(current[key])}`);
    console.log(`        + ${clip(wanted[key])}`);
  }
}

async function main() {
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").host;
    } catch {
      return "(unparseable DATABASE_URL)";
    }
  })();
  console.log(`Database: ${host}`);
  console.log(APPLY ? "Mode: APPLY\n" : "Mode: dry run (pass --apply to write)\n");

  let pending = 0;

  // ── Profile ──
  console.log("Profile");
  const profile = await prisma.profile.findUnique({ where: { id: "main" } });
  const profileChanged = diff(profile ?? {}, PROFILE);
  report("profile", profile ?? {}, PROFILE, profileChanged);
  pending += profileChanged.length;

  // ── Experiences ──
  console.log("\nExperience");
  const existing = await prisma.experience.findMany({
    include: {
      tags: true,
      links: true,
      metrics: { orderBy: { sortOrder: "asc" } },
      highlights: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const claimed = new Set<string>();
  const plans = EXPERIENCES.map((content, sortOrder) => {
    const matches = existing.filter((row) =>
      content.match.some((fragment) => normalize(row.company).includes(fragment))
    );
    if (matches.length > 1) {
      throw new Error(
        `"${content.company}" matches ${matches.length} existing rows (${matches
          .map((m) => `${m.title} @ ${m.company}`)
          .join("; ")}). Merge or delete the extras in /admin/experience, then re-run.`
      );
    }
    const row = matches[0];
    if (row) claimed.add(row.id);

    const { match: _match, ...fields } = content;
    void _match;
    const map = HIGHLIGHTS[content.company];
    const wanted = {
      ...fields,
      sortOrder,
      headline: map?.headline ?? "",
      highlights: (map?.items ?? []).map((h) => ({
        kind: h.kind,
        title: h.title,
        detail: h.detail.join("\n\n"),
        icon: h.icon ?? "",
        viz: h.viz ?? "",
        areas: h.areas ?? "",
        linkLabel: h.link?.label ?? "",
        linkUrl: h.link?.url ?? "",
      })),
    };
    const current = row
      ? {
          period: row.period,
          title: row.title,
          company: row.company,
          companyUrl: row.companyUrl,
          description: row.description,
          sortOrder: row.sortOrder,
          tags: row.tags.map((t) => t.label),
          links: row.links.map((l) => ({ label: l.label, url: l.url })),
          metrics: row.metrics.map((m) => ({ value: m.value, label: m.label })),
          headline: row.headline,
          highlights: row.highlights.map((h) => ({
            kind: h.kind,
            title: h.title,
            detail: h.detail,
            icon: h.icon,
            viz: h.viz,
            areas: h.areas,
            linkLabel: h.linkLabel,
            linkUrl: h.linkUrl,
          })),
        }
      : {};
    const changed = row ? diff(current, wanted) : Object.keys(wanted);
    if (row) {
      report(`${wanted.title} · ${wanted.company} (${row.id})`, current, wanted, changed);
    } else {
      console.log(`  + ${wanted.title} · ${wanted.company}: create`);
    }
    pending += changed.length;
    return { row, wanted, changed };
  });

  const unmatched = existing.filter((row) => !claimed.has(row.id));
  for (const row of unmatched) {
    console.log(
      `  ${PRUNE ? "-" : "?"} ${row.title} · ${row.company} (${row.id}): not in résumé, ${
        PRUNE ? "delete" : "left as is (pass --prune to delete)"
      }`
    );
  }
  if (PRUNE) pending += unmatched.length;

  // ── Project ──
  console.log("\nProject");
  const project = await prisma.project.findFirst({
    where: { title: PROJECT.title },
    include: { tags: true },
  });
  const projectCurrent = project
    ? { ...project, tags: project.tags.map((t) => t.label) }
    : {};
  const projectChanged = project ? diff(projectCurrent, PROJECT) : Object.keys(PROJECT);
  if (project) {
    report(PROJECT.title, projectCurrent, PROJECT, projectChanged);
  } else {
    console.log(`  + ${PROJECT.title}: create`);
  }
  pending += projectChanged.length;

  if (pending === 0) {
    console.log("\n✓ Database already matches the résumé. Nothing to do.");
    return;
  }
  if (!APPLY) {
    console.log(`\n${pending} field change(s) pending. Re-run with --apply to write them.`);
    return;
  }

  // ── Write ──
  await prisma.$transaction(
    async (tx) => {
      if (profileChanged.length > 0) {
        await tx.profile.upsert({
          where: { id: "main" },
          update: PROFILE,
          create: { id: "main", ...PROFILE },
        });
      }

      for (const { row, wanted, changed } of plans) {
        if (changed.length === 0) continue;
        const { tags, links, metrics, highlights, ...scalars } = wanted;
        const children = {
          tags: { create: tags.map((label) => ({ label })) },
          links: { create: links },
          metrics: { create: metrics.map((m, i) => ({ ...m, sortOrder: i })) },
          highlights: { create: highlights.map((h, i) => ({ ...h, sortOrder: i })) },
        };
        if (row) {
          await tx.experienceTag.deleteMany({ where: { experienceId: row.id } });
          await tx.experienceLink.deleteMany({ where: { experienceId: row.id } });
          await tx.experienceMetric.deleteMany({ where: { experienceId: row.id } });
          await tx.experienceHighlight.deleteMany({ where: { experienceId: row.id } });
          await tx.experience.update({ where: { id: row.id }, data: { ...scalars, ...children } });
        } else {
          await tx.experience.create({ data: { ...scalars, ...children } });
        }
      }

      if (PRUNE && unmatched.length > 0) {
        await tx.experience.deleteMany({ where: { id: { in: unmatched.map((r) => r.id) } } });
      }

      if (projectChanged.length > 0) {
        const { tags, ...scalars } = PROJECT;
        if (project) {
          await tx.projectTag.deleteMany({ where: { projectId: project.id } });
          await tx.project.update({
            where: { id: project.id },
            data: { ...scalars, tags: { create: tags.map((label) => ({ label })) } },
          });
        } else {
          await tx.project.create({
            data: { ...scalars, tags: { create: tags.map((label) => ({ label })) } },
          });
        }
      }
    },
    { timeout: 30_000 }
  );

  console.log(`\n✅ Applied ${pending} field change(s).`);
  console.log(
    "If irah.dev still shows the old content after a couple of minutes, redeploy (push a commit or use Redeploy in Vercel)."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
