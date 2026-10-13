/**
 * Sync profile, experience and the featured project with the current résumé.
 *
 *   npx tsx prisma/sync-resume.ts            # dry run: print the planned changes
 *   npx tsx prisma/sync-resume.ts --apply    # write them
 *   npx tsx prisma/sync-resume.ts --apply --prune   # also delete unmatched experiences
 *
 * This file is the source of truth for résumé content. Edit it, re-run it.
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
  /** Used only when the existing row has no company URL */
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
    include: { tags: true, links: true, metrics: { orderBy: { sortOrder: "asc" } } },
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
    const wanted = {
      ...fields,
      companyUrl: row?.companyUrl || content.companyUrl,
      sortOrder,
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
        const { tags, links, metrics, ...scalars } = wanted;
        const children = {
          tags: { create: tags.map((label) => ({ label })) },
          links: { create: links },
          metrics: { create: metrics.map((m, i) => ({ ...m, sortOrder: i })) },
        };
        if (row) {
          await tx.experienceTag.deleteMany({ where: { experienceId: row.id } });
          await tx.experienceLink.deleteMany({ where: { experienceId: row.id } });
          await tx.experienceMetric.deleteMany({ where: { experienceId: row.id } });
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

  console.log(`\n✅ Applied ${pending} field change(s). The home page picks them up within 60 seconds.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
