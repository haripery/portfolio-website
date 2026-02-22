"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { BlogCategory } from "@/generated/prisma/client";

export async function getBlogPosts(opts?: {
  published?: boolean;
  category?: string;
}) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        ...(opts?.published !== undefined ? { published: opts.published } : {}),
        ...(opts?.category
          ? { category: opts.category as BlogCategory }
          : {}),
      },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug },
      include: { tags: true },
    });
  } catch {
    return null;
  }
}

export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: { tags: true },
  });
}

export async function createBlogPost(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = blogPostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, ...postData } = parsed.data;

  const post = await prisma.blogPost.create({
    data: {
      ...postData,
      publishedAt: postData.published ? new Date() : null,
      tags: { create: tags.map((label) => ({ label })) },
    },
  });

  revalidatePath("/blog");
  revalidatePath("/");
  return { success: true, data: post };
}

export async function updateBlogPost(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = blogPostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, ...postData } = parsed.data;
  const existing = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.$transaction([
    prisma.blogTag.deleteMany({ where: { blogPostId: id } }),
    prisma.blogPost.update({
      where: { id },
      data: {
        ...postData,
        // Only set publishedAt on first publish
        publishedAt:
          postData.published && !existing?.publishedAt
            ? new Date()
            : existing?.publishedAt ?? null,
        tags: { create: tags.map((label) => ({ label })) },
      },
    }),
  ]);

  revalidatePath("/blog");
  revalidatePath(`/blog/${postData.slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const post = await prisma.blogPost.findUnique({ where: { id } });
  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function toggleBlogPostPublished(id: string, published: boolean) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const existing = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      published,
      publishedAt:
        published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/");
  return { success: true };
}
