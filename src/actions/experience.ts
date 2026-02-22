"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  try {
    return await prisma.experience.findMany({
      include: {
        tags: true,
        links: true,
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function createExperience(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = experienceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, links, ...experienceData } = parsed.data;

  const experience = await prisma.experience.create({
    data: {
      ...experienceData,
      tags: { create: tags.map((label) => ({ label })) },
      links: { create: links },
    },
  });

  revalidatePath("/");
  return { success: true, data: experience };
}

export async function updateExperience(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = experienceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { tags, links, ...experienceData } = parsed.data;

  await prisma.$transaction([
    prisma.experienceTag.deleteMany({ where: { experienceId: id } }),
    prisma.experienceLink.deleteMany({ where: { experienceId: id } }),
    prisma.experience.update({
      where: { id },
      data: {
        ...experienceData,
        tags: { create: tags.map((label) => ({ label })) },
        links: { create: links },
      },
    }),
  ]);

  revalidatePath("/");
  return { success: true };
}

export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.experience.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

export async function reorderExperiences(ids: string[]) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.experience.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/");
  return { success: true };
}
