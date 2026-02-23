"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createHash } from "crypto";

// ── Public: Create a comment (no auth required) ──
//
// CSRF Protection: Next.js Server Actions validate the Origin header
// automatically, rejecting cross-origin POST requests. No explicit CSRF
// tokens are needed. Additional defenses: honeypot field, IP-based rate
// limiting (5 per 10 min), and Zod schema validation.

export async function createComment(data: unknown) {
  const parsed = commentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  // Honeypot: if the hidden "website" field has any value, silently reject
  if (parsed.data.website) {
    return { success: true };
  }

  // Verify the blog post exists and is published
  const post = await prisma.blogPost.findUnique({
    where: { id: parsed.data.blogPostId },
    select: { id: true, slug: true, published: true },
  });
  if (!post || !post.published) {
    return { success: false, error: "Blog post not found" };
  }

  // Hash the IP for rate limiting
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // Rate limit: max 5 comments per IP per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await prisma.comment.count({
    where: {
      ipHash,
      createdAt: { gte: tenMinutesAgo },
    },
  });
  if (recentCount >= 5) {
    return { success: false, error: "Too many comments. Please wait a few minutes." };
  }

  await prisma.comment.create({
    data: {
      body: parsed.data.body,
      blogPostId: parsed.data.blogPostId,
      ipHash,
    },
  });

  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

// ── Public: Get comments for a blog post ──

export async function getCommentsByPostId(blogPostId: string) {
  try {
    return await prisma.comment.findMany({
      where: { blogPostId },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

// ── Admin: Get all comments (with post info) ──

export async function getAllComments() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.comment.findMany({
    include: {
      blogPost: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Admin: Delete a comment ──

export async function deleteComment(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { blogPost: { select: { slug: true } } },
  });

  if (!comment) return { success: false, error: "Comment not found" };

  await prisma.comment.delete({ where: { id } });

  revalidatePath(`/blog/${comment.blogPost.slug}`);
  revalidatePath("/admin/comments");
  return { success: true };
}

// ── Admin: Get total comment count (for dashboard) ──

export async function getCommentCount() {
  const session = await auth();
  if (!session?.user) return 0;

  return prisma.comment.count();
}
