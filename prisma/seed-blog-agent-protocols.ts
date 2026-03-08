import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SLUG = "agent-protocols-portfolio";

const CONTENT = `
<p>Three new protocols are defining how AI agents communicate with frontends, tools, and each other: AG-UI for agent-to-user streaming, A2A for agent-to-agent coordination, and A2UI for generative UI.</p>

<p>Instead of just explaining them, I built a live demo that uses all three. Three agents collaborate to analyze your browsing context, build a visitor persona, and generate personalized portfolio recommendations — with every protocol event visible in real-time.</p>

<h2>The Protocol Stack</h2>
<p>AG-UI (by CopilotKit) standardizes agent-to-frontend communication. A2A (by Google) enables multi-agent discovery and coordination. A2UI (by Google) lets agents generate rich, interactive UI components.</p>

<h2>Live Demo</h2>
<p>Click "Run Analysis" above to see the demo in action. The Protocol Inspector shows every AG-UI event, A2A message, and A2UI envelope flowing in real-time.</p>

<h2>How It Works</h2>
<p>The Tracker Agent collects visitor signals. The Profiler Agent classifies them into a persona using Claude. The Advisor Agent generates personalized recommendations with rich UI components. All orchestrated by a Coordinator using A2A task routing, with AG-UI events streamed to the frontend.</p>
`.trim();

async function main() {
  console.log("Seeding/updating agent protocols blog post...");

  const existing = await prisma.blogPost.findUnique({
    where: { slug: SLUG },
  });

  if (existing) {
    await prisma.blogPost.update({
      where: { slug: SLUG },
      data: {
        title: "I Built My Portfolio with Three Agent Protocols",
        excerpt:
          "A live demo of AG-UI, A2A, and A2UI protocols — three agents collaborate to analyze visitors and generate personalized recommendations in real-time.",
        content: CONTENT,
        readTime: "8 min read",
      },
    });
    console.log(`✓ Blog post updated: "${SLUG}"`);
    return;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: "I Built My Portfolio with Three Agent Protocols",
      slug: SLUG,
      excerpt:
        "A live demo of AG-UI, A2A, and A2UI protocols — three agents collaborate to analyze visitors and generate personalized recommendations in real-time.",
      content: CONTENT,
      contentJson: "{}",
      category: "AI",
      published: true,
      featured: false,
      readTime: "8 min read",
      publishedAt: new Date("2026-03-08"),
      tags: {
        create: [
          { label: "AG-UI" },
          { label: "A2A" },
          { label: "A2UI" },
          { label: "AI Agents" },
          { label: "Protocols" },
          { label: "Frontend" },
        ],
      },
    },
  });

  console.log(`✓ Blog post created: "${post.title}" (${post.slug})`);
  console.log("\n✅ Agent protocols blog post seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
