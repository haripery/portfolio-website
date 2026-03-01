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
<p>The tech interview is being redesigned in real time. In 2026, 43% of organizations use AI in their hiring process — nearly double the 26% just a year before. One in three companies say AI will fully run their hiring process by 2026. But the most interesting shift isn't about automation replacing humans. It's about what companies are choosing to test for when AI can solve a LeetCode problem in seconds.</p>

<p>Some companies are banning AI from interviews. Others are requiring it. The ones worth watching are rethinking what an interview even means. Here's how companies like Canva, Shopify, Mercor, and Duolingo are handling this — and what it signals about where hiring is headed.</p>

<h2>Canva: "Use AI in Our Interviews. We Insist."</h2>
<p>In June 2025, Canva's head of platforms Simon Newton published a blog post that turned heads across the industry. All Backend, Frontend, and Machine Learning engineering candidates at Canva are now expected to use AI coding tools during technical interviews.</p>

<h2>Shopify: AI-First From Day One</h2>
<p>Shopify has been one of the clearest voices in tech on making AI a core part of how the company operates. In April 2025, CEO Tobi Lütke shared an internal memo: AI usage is now a baseline expectation at Shopify.</p>

<h2>Mercor: When the Interviewer Is the AI</h2>
<p>Mercor takes the concept further than any traditional company — the interviewer itself is AI. Candidates complete a roughly 20-minute structured video interview where an AI generates questions, transcribes responses, and evaluates performance.</p>

<h2>Duolingo: Same Policy, Different Backlash</h2>
<p>Duolingo adopted an almost identical policy to Shopify in April 2025. But where Shopify's memo landed as forward-thinking, Duolingo's triggered a firestorm with over 1,000 negative comments.</p>

<h2>The Other Side: Companies Banning AI</h2>
<p>While Canva, Shopify, and Mercor embrace AI in interviews, the biggest tech companies — Amazon, Google, Goldman Sachs, Meta — are moving in the opposite direction.</p>

<h2>What This Means for Engineers and CS Students</h2>
<p>The company landscape breaks into three distinct camps: AI-Required, AI-Banned, and AI-as-Culture. The engineers who thrive won't master just one camp. They'll be the ones who can walk into any of these environments and adapt.</p>
`.trim();

async function main() {
  console.log("Seeding/updating AI hiring revolution blog post...");

  const existing = await prisma.blogPost.findUnique({
    where: { slug: SLUG },
  });

  if (existing) {
    await prisma.blogPost.update({
      where: { slug: SLUG },
      data: {
        title: "AI Is Rewriting the Interview: How Shopify, Canva & Others Are Changing Hiring Forever",
        excerpt:
          "Some companies are banning AI from interviews. Others are requiring it. The ones worth watching are rethinking what an interview even means.",
        content: CONTENT,
        readTime: "12 min read",
      },
    });
    console.log(`✓ Blog post updated: "${SLUG}"`);
    return;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: "AI Is Rewriting the Interview: How Shopify, Canva & Others Are Changing Hiring Forever",
      slug: SLUG,
      excerpt:
        "Some companies are banning AI from interviews. Others are requiring it. The ones worth watching are rethinking what an interview even means.",
      content: CONTENT,
      contentJson: "{}",
      category: "AI",
      published: true,
      featured: true,
      readTime: "12 min read",
      publishedAt: new Date("2026-03-01"),
      tags: {
        create: [
          { label: "AI" },
          { label: "Hiring" },
          { label: "Career" },
          { label: "Interviews" },
          { label: "Tech Industry" },
        ],
      },
    },
  });

  console.log(`✓ Blog post created: "${post.title}" (${post.slug})`);
  console.log("\n✅ AI hiring revolution blog post seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
