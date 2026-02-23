import { getBlogPosts } from "@/actions/blog";
import { TrackedLink } from "@/components/public/TrackedLink";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { TagPill } from "@/components/public/TagPill";
import type { BlogCategory } from "@/generated/prisma/client";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on code, learning, and what it means to build near the singularity.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blog`,
  },
};

export const revalidate = 300;

const CATEGORY_LABELS: Record<string, string> = {
  LEARNINGS: "My Learnings",
  MENTORSHIP: "Mentorship",
  AI: "AI Explorations",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await getBlogPosts({
    published: true,
    category: category ?? undefined,
  });

  const FILTERS = ["All", "LEARNINGS", "MENTORSHIP", "AI"] as const;

  return (
    <div className="min-h-screen mosaic-bg text-forest">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <ThemeToggle />
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-forest mb-2"
          style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
        >
          Writing
        </h1>
        <p className="text-sm text-ink/60 mb-10">
          Thoughts on code, learning, and what it means to build near the singularity.
        </p>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive =
              filter === "All" ? !category : category === filter;
            return (
              <TrackedLink
                event="blog_category_filtered"
                properties={{ category: filter }}
                key={filter}
                href={filter === "All" ? "/blog" : `/blog?category=${filter}`}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-forest text-paper"
                    : "border border-ink/20 text-ink/55 hover:border-forest hover:text-forest"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {filter === "All" ? "All" : CATEGORY_LABELS[filter]}
              </TrackedLink>
            );
          })}
        </div>

        {/* Post list */}
        {posts.length > 0 ? (
          <ol className="divide-y divide-ink/10">
            {posts.map((post) => (
              <li key={post.id}>
                <TrackedLink
                  event="blog_post_clicked"
                  properties={{
                    post_slug: post.slug,
                    post_title: post.title,
                    post_category: post.category,
                    source: "blog_listing",
                  }}
                  href={`/blog/${post.slug}`}
                  className="group block py-6 transition-colors hover:bg-forest/3"
                >
                  <p
                    className="mb-1.5 text-[10px] uppercase tracking-widest text-ink/45"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                    {" · "}
                    {CATEGORY_LABELS[post.category] ?? post.category}
                    {post.readTime && ` · ${post.readTime}`}
                  </p>
                  <h2 className="text-lg font-semibold text-forest transition-colors group-hover:text-coral">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-ink/60 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <li key={tag.id}>
                          <TagPill label={tag.label} />
                        </li>
                      ))}
                    </ul>
                  )}
                </TrackedLink>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-ink/40">No posts published in this category yet.</p>
        )}
      </div>
    </div>
  );
}
