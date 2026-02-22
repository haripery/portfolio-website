import { auth } from "@/lib/auth";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const resumeSchema = z.object({
  experiences: z.array(
    z.object({
      period: z
        .string()
        .describe('Employment period, e.g. "Jan 2022 — Present"'),
      title: z.string().describe("Job title / role"),
      company: z.string().describe("Company name"),
      companyUrl: z
        .string()
        .describe("Company website URL, empty string if unknown")
        .default(""),
      description: z
        .string()
        .describe(
          "Rich HTML description of responsibilities and achievements using <p>, <ul>, <li>, <strong> tags"
        ),
      sortOrder: z
        .number()
        .describe(
          "0-based sort order, 0 = most recent, incrementing for older roles"
        ),
      tags: z
        .array(z.string())
        .describe("Technologies, frameworks, or skills used"),
      links: z
        .array(
          z.object({
            label: z.string().describe("Link label, e.g. 'Project' or 'Demo'"),
            url: z.string().describe("Full URL"),
          })
        )
        .describe("Relevant links for this role")
        .default([]),
    })
  ),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
    });
  }

  if (file.type !== "application/pdf") {
    return new Response(
      JSON.stringify({ error: "Only PDF files are supported" }),
      { status: 400 }
    );
  }

  const TEN_MB = 10 * 1024 * 1024;
  if (file.size > TEN_MB) {
    return new Response(JSON.stringify({ error: "File exceeds 10MB limit" }), {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: resumeSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: buffer,
              mediaType: "application/pdf",
            },
            {
              type: "text",
              text: `Extract all work experience entries from this resume.
For each role:
- Set period as a human-readable date range (e.g. "Jan 2022 — Present" or "2019 — 2021")
- Write the description as rich HTML using <p>, <ul><li>, and <strong> tags to highlight achievements
- List all relevant technologies and skills as tags
- Set sortOrder so that the most recent role is 0, next is 1, etc.
- Set companyUrl to the company website if you can infer it, otherwise empty string
- Only include links if they appear in the resume`,
            },
          ],
        },
      ],
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[parse-resume] generateObject error:", message);
    return new Response(
      JSON.stringify({ error: `AI parsing failed: ${message}` }),
      { status: 500 }
    );
  }
}
