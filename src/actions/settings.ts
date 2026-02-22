"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema, changePasswordSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "main" } });
  } catch {
    return null;
  }
}

export async function updateSettings(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = siteSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true };
}

export async function changePassword(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) return { success: false, error: "User not found" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
