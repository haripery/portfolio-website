import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const hash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "changeme123!",
    12
  );
  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@nearthesingularity.com" },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@nearthesingularity.com",
      passwordHash: hash,
    },
  });
  console.log("✓ Admin user seeded");

  // Singleton profile
  await prisma.profile.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      name: "Your Name",
      role: "Software Engineer & Frontend Developer",
      tagline:
        "I build accessible, high-performance products for the web — and explore what it means to build near the singularity.",
      bio: "<p>I'm a software engineer based somewhere at the intersection of code, curiosity, and caffeine. I specialize in building great digital experiences — the kind that feel fast, accessible, and just <em>right</em>.</p><p>When I'm not pushing pixels, I'm writing about what I learn, mentoring developers, and exploring where AI is taking us all.</p>",
      email: "hello@nearthesingularity.com",
      socials: {
        create: [
          { platform: "github", url: "https://github.com/yourusername", label: "GitHub", sortOrder: 1 },
          { platform: "linkedin", url: "https://linkedin.com/in/yourusername", label: "LinkedIn", sortOrder: 2 },
          { platform: "twitter", url: "https://twitter.com/yourusername", label: "Twitter", sortOrder: 3 },
          { platform: "email", url: "hello@nearthesingularity.com", label: "Email", sortOrder: 4 },
        ],
      },
    },
  });
  console.log("✓ Profile seeded");

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      siteTitle: "Near the Singularity",
      siteDescription:
        "Portfolio, blog, and experiments from a frontend developer building near the singularity.",
      footerText:
        "Loosely designed in Figma and coded in VS Code. Built with Next.js and Tailwind CSS, deployed with Vercel.",
    },
  });
  console.log("✓ Site settings seeded");

  // Experience entries
  const experiences = await prisma.experience.count();
  if (experiences === 0) {
    await prisma.experience.createMany({
      data: [
        {
          period: "2023 — Present",
          title: "Senior Software Engineer",
          company: "Acme Corp",
          companyUrl: "https://acmecorp.com",
          description:
            "<p>Lead frontend architecture for the company's main SaaS product. Improved Core Web Vitals scores across all pages and reduced bundle size by 40%.</p>",
          sortOrder: 1,
        },
        {
          period: "2021 — 2023",
          title: "Software Engineer",
          company: "Startup Inc.",
          companyUrl: "https://startupinc.com",
          description:
            "<p>Built customer-facing features from 0 to 1, working in a fast-paced team shipping weekly. Contributed to design system and component library.</p>",
          sortOrder: 2,
        },
        {
          period: "2019 — 2021",
          title: "Frontend Developer",
          company: "Agency XYZ",
          description:
            "<p>Delivered responsive websites and web applications for 20+ client projects across finance, retail, and healthcare sectors.</p>",
          sortOrder: 3,
        },
      ],
    });

    // Add tags to experiences
    const [exp1, exp2, exp3] = await prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
    });

    await prisma.experienceTag.createMany({
      data: [
        { label: "React", experienceId: exp1.id },
        { label: "TypeScript", experienceId: exp1.id },
        { label: "Next.js", experienceId: exp1.id },
        { label: "AWS", experienceId: exp1.id },
        { label: "React", experienceId: exp2.id },
        { label: "Node.js", experienceId: exp2.id },
        { label: "PostgreSQL", experienceId: exp2.id },
        { label: "JavaScript", experienceId: exp3.id },
        { label: "Vue.js", experienceId: exp3.id },
        { label: "CSS", experienceId: exp3.id },
      ],
    });
    console.log("✓ Experiences seeded");
  }

  // Projects
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "Spotlight Dashboard",
          description:
            "A real-time analytics dashboard for monitoring user engagement across multiple channels. Powers data decisions for 4.2k monthly active users.",
          url: "https://spotlight.example.com",
          githubUrl: "https://github.com/yourusername/spotlight",
          stats: "4.2k monthly users",
          featured: true,
          sortOrder: 1,
        },
        {
          title: "Nexus Component Library",
          description:
            "An open-source accessible component library built with React and TypeScript, following WAI-ARIA standards.",
          url: "https://nexus-ui.example.com",
          githubUrl: "https://github.com/yourusername/nexus-ui",
          featured: true,
          sortOrder: 2,
        },
        {
          title: "Halcyon VS Code Theme",
          description:
            "A minimal, dark blue theme for VS Code inspired by late-night coding sessions. 8k+ installs.",
          url: "https://marketplace.visualstudio.com/items?itemName=example",
          stats: "8k+ installs",
          featured: false,
          archived: false,
          sortOrder: 3,
        },
        {
          title: "Build a Spotify Connected App",
          description:
            "Video course for intermediate developers walking through building a Spotify-connected web app with React and Node.",
          featured: false,
          archived: true,
          sortOrder: 4,
        },
      ],
    });

    const [p1, p2, p3, p4] = await prisma.project.findMany({
      orderBy: { sortOrder: "asc" },
    });

    await prisma.projectTag.createMany({
      data: [
        { label: "React", projectId: p1.id },
        { label: "Next.js", projectId: p1.id },
        { label: "TypeScript", projectId: p1.id },
        { label: "Chart.js", projectId: p1.id },
        { label: "React", projectId: p2.id },
        { label: "TypeScript", projectId: p2.id },
        { label: "Radix UI", projectId: p2.id },
        { label: "Tailwind CSS", projectId: p2.id },
        { label: "VS Code", projectId: p3.id },
        { label: "JSON", projectId: p3.id },
        { label: "React", projectId: p4.id },
        { label: "Node.js", projectId: p4.id },
        { label: "Spotify API", projectId: p4.id },
      ],
    });
    console.log("✓ Projects seeded");
  }

  // Blog posts
  const blogCount = await prisma.blogPost.count();
  if (blogCount === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          title: "What I Learned Building My First Production Next.js App",
          slug: "learnings-first-nextjs-app",
          excerpt:
            "From routing gotchas to deployment surprises — the real lessons from shipping Next.js in production.",
          content:
            "<h2>The Setup</h2><p>I started this project like most developers do: overconfident and underprepared. Here's what I learned.</p><h2>Key Learnings</h2><p>Server components are not a silver bullet, but they are genuinely transformative when used correctly. The key is knowing <em>when</em> to reach for them.</p><p>The App Router changed how I think about data fetching. Colocating your data fetching with the component that needs it reduces waterfall rendering and makes your code more readable.</p>",
          contentJson:
            '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Setup"}]},{"type":"paragraph","content":[{"type":"text","text":"I started this project like most developers do: overconfident and underprepared."}]}]}',
          category: "LEARNINGS",
          published: true,
          featured: true,
          readTime: "6 min read",
          publishedAt: new Date("2025-11-15"),
        },
        {
          title: "How AI Changed the Way I Mentor Junior Developers",
          slug: "ai-mentorship-junior-devs",
          excerpt:
            "Pair programming with AI has fundamentally shifted the mentor-mentee dynamic. Here's how I've adapted.",
          content:
            "<p>For years, my go-to mentorship technique was the Socratic method — ask questions, don't give answers. But in the era of LLMs, that approach needs a significant update.</p><h2>The New Dynamic</h2><p>Junior developers now arrive with AI tools already in their workflow. The question isn't whether to use them — it's how to use them <em>well</em>.</p>",
          contentJson: "{}",
          category: "MENTORSHIP",
          published: true,
          readTime: "8 min read",
          publishedAt: new Date("2025-12-01"),
        },
        {
          title: "Building Near the Singularity: What It Actually Feels Like",
          slug: "building-near-the-singularity",
          excerpt:
            "A personal essay on navigating software engineering in an era of exponential AI capability.",
          content:
            "<p>There's a particular vertigo that comes with being a software engineer right now. The ground keeps shifting. The tools keep getting better. And the question 'what should I actually be doing?' gets harder to answer by the week.</p><p>This post is me thinking out loud about that vertigo — and why I think it's actually pointing toward something interesting.</p>",
          contentJson: "{}",
          category: "AI",
          published: true,
          featured: true,
          readTime: "10 min read",
          publishedAt: new Date("2026-01-08"),
        },
        {
          title: "TypeScript Patterns I Wish I Knew Earlier",
          slug: "typescript-patterns-i-wish-i-knew",
          excerpt:
            "A collection of practical TypeScript patterns that have made my code significantly more maintainable.",
          content:
            "<p>TypeScript is one of those tools that rewards patience. The type system is deceptively powerful, and the best patterns aren't obvious until you've felt the pain of not using them.</p>",
          contentJson: "{}",
          category: "LEARNINGS",
          published: true,
          readTime: "12 min read",
          publishedAt: new Date("2026-01-20"),
        },
        {
          title: "The Art of the Code Review (Draft)",
          slug: "art-of-the-code-review",
          excerpt: "What separates a useful code review from a demoralizing one.",
          content: "<p>Coming soon...</p>",
          contentJson: "{}",
          category: "MENTORSHIP",
          published: false,
          readTime: "7 min read",
        },
        {
          title: "Claude API Deep Dive: Building an AI Writing Assistant",
          slug: "claude-api-ai-writing-assistant",
          excerpt:
            "A hands-on walkthrough of integrating the Claude API into a real application.",
          content:
            "<p>After spending several weeks building AI-powered features, I have a lot of opinions about the current state of the developer experience. Let's dig in.</p>",
          contentJson: "{}",
          category: "AI",
          published: false,
          readTime: "15 min read",
        },
      ],
    });

    const posts = await prisma.blogPost.findMany();

    for (const post of posts) {
      if (post.slug.includes("nextjs")) {
        await prisma.blogTag.createMany({
          data: [
            { label: "Next.js", blogPostId: post.id },
            { label: "React", blogPostId: post.id },
            { label: "TypeScript", blogPostId: post.id },
          ],
        });
      } else if (post.slug.includes("ai-mentorship")) {
        await prisma.blogTag.createMany({
          data: [
            { label: "Mentorship", blogPostId: post.id },
            { label: "AI", blogPostId: post.id },
            { label: "Career", blogPostId: post.id },
          ],
        });
      } else if (post.slug.includes("singularity")) {
        await prisma.blogTag.createMany({
          data: [
            { label: "AI", blogPostId: post.id },
            { label: "Career", blogPostId: post.id },
            { label: "Reflections", blogPostId: post.id },
          ],
        });
      } else if (post.slug.includes("typescript")) {
        await prisma.blogTag.createMany({
          data: [
            { label: "TypeScript", blogPostId: post.id },
            { label: "JavaScript", blogPostId: post.id },
          ],
        });
      }
    }
    console.log("✓ Blog posts seeded");
  }

  console.log("\n✅ Database seeded successfully!");
  console.log(
    `\nAdmin login: ${process.env.SEED_ADMIN_EMAIL ?? "admin@nearthesingularity.com"}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
