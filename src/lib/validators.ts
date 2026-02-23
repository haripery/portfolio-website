import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  tagline: z.string(),
  bio: z.string(),
  email: z.string().email("Valid email required"),
  photoUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  resumeUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

export const socialSchema = z.object({
  platform: z.string().min(1),
  url: z.string().min(1),
  label: z.string(),
  sortOrder: z.number().int().default(0),
});

export const experienceSchema = z.object({
  period: z.string().min(1, "Period is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  companyUrl: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url("Must be a valid URL"),
      })
    )
    .default([]),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  stats: z.string().default(""),
  featured: z.boolean().default(false),
  archived: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(1, "Slug is required"),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  contentJson: z.string().default("{}"),
  category: z.enum(["LEARNINGS", "MENTORSHIP", "AI"]),
  coverImage: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  readTime: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  siteDescription: z.string().default(""),
  ogImage: z.string().url("Must be a valid URL").or(z.literal("")).default(""),
  gaTrackingId: z.string().default(""),
  footerText: z.string().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
  blogPostId: z.string().min(1),
  website: z.string().max(0).optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
