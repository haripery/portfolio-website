import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SLUG = "how-i-built-this-portfolio-architecture-and-tech-stack";

const CONTENT = `
<p>This post is a walkthrough of how I built this portfolio website, the tech stack, architecture decisions, and key patterns that hold it all together. The full source code is available on <a href="https://github.com/haripery/portfolio-website" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>

<h2>Tech Stack</h2>

<ul>
  <li><strong>Next.js 16 (App Router)</strong> Full-stack framework with Server Components, Server Actions, and ISR.</li>
  <li><strong>TypeScript + React 19</strong> End-to-end type safety.</li>
  <li><strong>PostgreSQL (Neon)</strong> Serverless Postgres with connection pooling via PgBouncer.</li>
  <li><strong>Prisma 7</strong> Type-safe ORM with migration tooling.</li>
  <li><strong>Tailwind CSS 4 + shadcn/ui</strong> Utility-first styling with accessible component primitives.</li>
  <li><strong>NextAuth.js v5</strong> JWT-based auth with a Credentials provider for admin access.</li>
  <li><strong>Cloudflare R2</strong> S3-compatible file storage with zero egress fees.</li>
  <li><strong>Vercel AI SDK + Claude</strong> AI-powered resume parsing and document-to-blog conversion.</li>
  <li><strong>PostHog</strong> Privacy-friendly analytics with custom event tracking.</li>
</ul>

<h2>Architecture</h2>

<p>The app is organized in clear layers:</p>

<pre><code>Client (Server + Client Components)
  ↓
Middleware (NextAuth edge auth)
  ↓
Server Actions ("use server" mutations)
  ↓
API Routes (file uploads, AI parsing, auth)
  ↓
Prisma (type-safe queries, transactions)
  ↓
PostgreSQL (Neon, pooled via PgBouncer)</code></pre>

<p>All content (blog posts, projects, experience, profile) lives in the database. No MDX files, no headless CMS. This means I can edit everything through the admin dashboard without redeploying.</p>

<h2>Key Decisions</h2>

<h3>Server Actions for All Mutations</h3>

<p>Every create, update, and delete operation is a <code>"use server"</code> function. No REST API boilerplate, just call a function from the UI and it runs on the server. Each action follows the same pattern: authenticate, validate with Zod, query the database, revalidate cached paths.</p>

<h3>Singleton Pattern</h3>

<p>The <code>Profile</code> and <code>SiteSettings</code> models use a fixed ID of <code>"main"</code>, always exactly one row. Simple to query, impossible to accidentally duplicate.</p>

<h3>Edge-Safe Auth Split</h3>

<p>NextAuth v5 config is split in two: a lightweight edge-safe config for the middleware (no bcrypt, no Prisma), and a full config for the actual credential verification. This lets route protection run on the edge while auth logic stays in Node.js.</p>

<h3>ISR for Performance</h3>

<p>Public pages use Incremental Static Regeneration. The home page revalidates every 60 seconds, blog posts every 5 minutes. Effectively static for visitors, but content changes reflect within minutes.</p>

<h2>Blog System</h2>

<p>The blog is the most feature-rich section. Posts are written in a <strong>Tiptap</strong> rich text editor with syntax-highlighted code blocks. Content is stored as both HTML (for rendering) and JSON (for editor state restoration).</p>

<p>Comments are anonymous with IP-based rate limiting (5 per 10 minutes), honeypot spam protection, and admin moderation. There's also a Document-to-Blog Importer that uses Claude to parse uploaded documents into structured post fields.</p>

<h2>Design System</h2>

<p>The visual identity uses a constrained palette: Paper (#F7F7F5) backgrounds, Forest (#1A3C2B) text, Coral (#FF8C69) accents, with a flat 2px border radius throughout. Typography pairs Space Grotesk (headings), Inter (body), and JetBrains Mono (code). Dark mode swaps the entire palette via CSS custom properties, persisted to localStorage with a system-preference fallback.</p>

<h2>Infrastructure</h2>

<p>Files are stored in <strong>Cloudflare R2</strong> (chosen for zero egress fees), uploaded via an admin API route with type/size validation. Analytics run through <strong>PostHog</strong> with a reverse proxy at <code>/ingest</code> to bypass ad blockers. The site deploys on <strong>Vercel</strong> with <code>prisma generate</code> running before <code>next build</code>.</p>

<h2>What I'd Improve</h2>

<ul>
  <li><strong>Content versioning</strong> no revision history on blog posts yet.</li>
  <li><strong>Image optimization</strong> uploaded images are served as-is from R2.</li>
  <li><strong>Full-text search</strong> not implemented, Postgres <code>tsvector</code> would be natural.</li>
  <li><strong>Automated tests</strong> no Playwright or Vitest coverage yet.</li>
</ul>

<p>Every choice was driven by a specific need, not hype. The result is a site that's fast, easy to manage, and fun to extend. Check out the <a href="https://github.com/haripery/portfolio-website" target="_blank" rel="noopener noreferrer">source code on GitHub</a>.</p>
`.trim();

async function main() {
  console.log("Seeding architecture blog post...");

  // Check if the post already exists
  const existing = await prisma.blogPost.findUnique({
    where: { slug: SLUG },
  });

  if (existing) {
    console.log(`Blog post with slug "${SLUG}" already exists. Skipping.`);
    return;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: "How I Built This Portfolio: Architecture and Tech Stack",
      slug: SLUG,
      excerpt:
        "A walkthrough of the architecture, tech stack, and key decisions behind this portfolio — Next.js, Prisma, Tailwind, and AI-powered features.",
      content: CONTENT,
      contentJson: "{}",
      category: "LEARNINGS",
      published: true,
      featured: true,
      readTime: "5 min read",
      publishedAt: new Date("2026-02-22"),
      tags: {
        create: [
          { label: "Next.js" },
          { label: "Architecture" },
          { label: "TypeScript" },
          { label: "Prisma" },
          { label: "Tailwind CSS" },
        ],
      },
    },
  });

  console.log(`✓ Blog post created: "${post.title}" (${post.slug})`);
  console.log(`  ID: ${post.id}`);
  console.log(`  Published: ${post.published}`);
  console.log(`  Category: ${post.category}`);
  console.log("\n✅ Architecture blog post seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
