import { auth } from "@/lib/auth";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import type { FilePart, TextPart } from "ai";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { checkRateLimit, aiRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const blogSchema = z.object({
  title: z.string().describe("Blog post title"),
  slug: z
    .string()
    .describe(
      "URL-friendly slug using lowercase letters and hyphens only, no special characters"
    ),
  excerpt: z
    .string()
    .describe(
      "2-3 sentence summary of the post that would appear in listings"
    ),
  content: z
    .string()
    .describe(
      "Full blog post content as rich HTML using <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>, <code>, <pre><code> tags. Write a complete, well-structured post."
    ),
  category: z
    .enum(["LEARNINGS", "MENTORSHIP", "AI"])
    .describe(
      "LEARNINGS = technical learnings and tutorials, MENTORSHIP = career and growth advice, AI = AI/ML topics"
    ),
  tags: z.array(z.string()).describe("5-8 relevant topic tags"),
  readTime: z
    .string()
    .describe('Estimated read time, e.g. "5 min read" or "8 min read"'),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Rate limit: 10 AI requests per 15 minutes
  const rl = await checkRateLimit(aiRateLimit);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
    });
  }

  const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
  ];
  const isAllowed =
    ALLOWED_TYPES.includes(file.type) ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".txt");

  if (!isAllowed) {
    return new Response(
      JSON.stringify({ error: "Only PDF, .md, and .txt files are supported" }),
      { status: 400 }
    );
  }

  const TEN_MB = 10 * 1024 * 1024;
  if (file.size > TEN_MB) {
    return new Response(JSON.stringify({ error: "File exceeds 10MB limit" }), {
      status: 400,
    });
  }

  const isPdf = file.type === "application/pdf";

  let contentPart: FilePart | TextPart;

  if (isPdf) {
    const buffer = Buffer.from(await file.arrayBuffer());
    contentPart = {
      type: "file",
      data: buffer,
      mediaType: "application/pdf",
    };
  } else {
    const text = await file.text();
    contentPart = {
      type: "text",
      text: `Here is the source document content:\n\n${text}`,
    };
  }

  try {
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: blogSchema,
      messages: [
        {
          role: "user",
          content: [
            contentPart,
            {
              type: "text",
              text: `Convert this document into a well-written blog post for a software engineering portfolio.
Write in first-person, professional but conversational tone.
Structure with clear headings, proper HTML formatting, and engaging content.
The post should feel natural and polished, not just a summary of the document.`,
            },
          ],
        },
      ],
    });

    // Ensure slug is clean and unique
    const cleanSlug = slugify(object.slug) + "-" + Date.now().toString(36);

    return Response.json({ ...object, slug: cleanSlug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[parse-document] generateObject error:", message);
    return new Response(
      JSON.stringify({ error: `AI parsing failed: ${message}` }),
      { status: 500 }
    );
  }
}
