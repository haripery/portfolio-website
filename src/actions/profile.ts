"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  try {
    return await prisma.profile.findUnique({
      where: { id: "main" },
      include: { socials: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    return null;
  }
}

export async function updateProfile(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  await prisma.profile.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateResumeUrl(resumeUrl: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Ensure profile exists then update only resumeUrl
  await prisma.profile.upsert({
    where: { id: "main" },
    update: { resumeUrl },
    create: { id: "main", resumeUrl },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateSocials(
  socials: { platform: string; url: string; label: string; sortOrder: number }[]
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Ensure profile exists
  await prisma.profile.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  // Replace all socials atomically
  await prisma.$transaction([
    prisma.social.deleteMany({ where: { profileId: "main" } }),
    prisma.social.createMany({
      data: socials.map((s) => ({ ...s, profileId: "main" })),
    }),
  ]);

  revalidatePath("/");
  return { success: true };
}
