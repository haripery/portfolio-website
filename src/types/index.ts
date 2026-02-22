import type {
  Profile,
  Social,
  Experience,
  ExperienceTag,
  ExperienceLink,
  Project,
  ProjectTag,
  BlogPost,
  BlogTag,
  SiteSettings,
  BlogCategory,
} from "@/generated/prisma/client";

export type ProfileWithSocials = Profile & { socials: Social[] };

export type ExperienceWithRelations = Experience & {
  tags: ExperienceTag[];
  links: ExperienceLink[];
};

export type ProjectWithTags = Project & { tags: ProjectTag[] };

export type BlogPostWithTags = BlogPost & { tags: BlogTag[] };

export type { BlogCategory, SiteSettings };

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string | object };
