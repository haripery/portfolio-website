"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getProjects(opts?: {
  featured?: boolean;
  archived?: boolean;
}) {
  try {
    return await prisma.project.findMany({
      where: opts ?? {},
      include: { tags: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { tags: true },
  });
}

export async function createProject(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, ...projectData } = parsed.data;

  const project = await prisma.project.create({
    data: {
      ...projectData,
      tags: { create: tags.map((label) => ({ label })) },
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  return { success: true, data: project };
}

export async function updateProject(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, ...projectData } = parsed.data;

  await prisma.$transaction([
    prisma.projectTag.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        tags: { create: tags.map((label) => ({ label })) },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/archive");
  return { success: true };
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/archive");
  return { success: true };
}

export async function toggleProjectFeatured(id: string, featured: boolean) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.project.update({ where: { id }, data: { featured } });
  revalidatePath("/");
  return { success: true };
}

export async function toggleProjectArchived(id: string, archived: boolean) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.project.update({ where: { id }, data: { archived } });
  revalidatePath("/");
  revalidatePath("/archive");
  return { success: true };
}
