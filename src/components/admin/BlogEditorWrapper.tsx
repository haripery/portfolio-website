"use client";

import dynamic from "next/dynamic";
import type { BlogPost, BlogTag } from "@/generated/prisma/client";

type InitialData = (BlogPost & { tags: BlogTag[] }) | undefined;

const BlogPostForm = dynamic(
  () =>
    import("@/components/admin/BlogPostForm").then((m) => m.BlogPostForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-md bg-slate-800" />
    ),
  }
);

export function BlogEditorWrapper({
  initialData,
}: {
  initialData?: InitialData;
}) {
  return <BlogPostForm initialData={initialData} />;
}
