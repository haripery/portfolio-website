import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SLUG = "ai-hiring-revolution-2026";

const CONTENT = `
<p><strong>The way companies hire and candidates apply has fundamentally changed.</strong> In 2026, 43% of organizations worldwide use AI in hiring — nearly double the 26% just one year prior — and 97.8% of Fortune 500 companies now run résumés through AI-powered applicant tracking systems before a human ever sees them.</p>

<p>For CS and engineering students entering this market, understanding how AI has transformed every stage of the hiring pipeline isn't optional — it's survival. Applications per job opening have tripled since 2021, ghosting rates exceed 60%, and an estimated 1 in 4 job candidates globally will be fake by 2028, according to Gartner.</p>

<p>This report breaks down what's actually happening, what data says about where things are heading, and what CS/engineering students should do about it — with specific numbers, tools, and strategies.</p>

<h2>Every Stage of Hiring Now Runs Through AI</h2>
<p>The modern interview pipeline barely resembles what existed five years ago. AI has infiltrated every step, from the moment you click "apply" to the final hiring decision.</p>

<h2>The AI Arms Race Is Making Hiring Worse for Everyone</h2>
<p>The most counterintuitive development in hiring is that AI tools — designed to make the process faster and better — have instead created what Greenhouse CEO Jon Stross calls an "AI doom loop" making everyone miserable.</p>

<h2>Deepfakes, Cheating Tools, and a Trust Crisis</h2>
<p>Beyond the arms race in applications, a more alarming development is unfolding: AI-powered interview fraud has become a genuine national security concern.</p>

<h2>The Companies and Platforms Reshaping Hiring</h2>
<p>A handful of companies and AI platforms are defining how hiring works in 2026.</p>

<h2>Regulations Are Catching Up, but Unevenly</h2>
<p>The regulatory landscape for AI in hiring is a patchwork that every job seeker should understand.</p>

<h2>New Roles Are Emerging as Fast as Old Ones Disappear</h2>
<p>The AI transformation isn't just changing how you get hired — it's redefining what you get hired to do.</p>

<h2>The Skills That Actually Get You Hired in 2026</h2>
<p>The data on what employers want is clear — and it defies some common assumptions.</p>

<h2>How to Actually Win in This Market</h2>
<p>The data points to a clear set of actionable strategies.</p>

<h2>Conclusion: The Market Rewards Adaptation</h2>
<p>The hiring landscape of 2026 is paradoxical. AI has made applying easier and screening faster, yet both cost-per-hire and time-to-hire have increased.</p>
`.trim();

async function main() {
  console.log("Seeding AI hiring revolution blog post...");

  const existing = await prisma.blogPost.findUnique({
    where: { slug: SLUG },
  });

  if (existing) {
    console.log(`Blog post with slug "${SLUG}" already exists. Skipping.`);
    return;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: "The AI Hiring Revolution Is Here, and It's Reshaping Everything",
      slug: SLUG,
      excerpt:
        "A data-driven survival guide for CS students entering the 2026 job market. 43% of organizations use AI in hiring, 75% of résumés are rejected before a human sees them, and the old playbook is dead.",
      content: CONTENT,
      contentJson: "{}",
      category: "AI",
      published: true,
      featured: true,
      readTime: "18 min read",
      publishedAt: new Date("2026-02-28"),
      tags: {
        create: [
          { label: "AI" },
          { label: "Hiring" },
          { label: "Career" },
          { label: "Job Market" },
          { label: "CS Students" },
        ],
      },
    },
  });

  console.log(`✓ Blog post created: "${post.title}" (${post.slug})`);
  console.log(`  ID: ${post.id}`);
  console.log(`  Published: ${post.published}`);
  console.log(`  Category: ${post.category}`);
  console.log("\n✅ AI hiring revolution blog post seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
