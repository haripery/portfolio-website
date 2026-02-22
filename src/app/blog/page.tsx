import { getBlogPosts } from "@/actions/blog";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { TagPill } from "@/components/public/TagPill";
import type { BlogCategory } from "@/generated/prisma/client";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen mosaic-bg text-[#1A3C2B]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[rgba(58,58,56,0.5)] transition-colors hover:text-[#1A3C2B]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>

        <h1
          className="text-3xl font-bold tracking-tight text-[#1A3C2B] mb-2"
          style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
        >
          Writing
        </h1>
        <p className="text-sm text-[rgba(58,58,56,0.6)] mb-10">
          Thoughts on code, learning, and what it means to build near the singularity.
        </p>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive =
              filter === "All" ? !category : category === filter;
            return (
              <Link
                key={filter}
                href={filter === "All" ? "/blog" : `/blog?category=${filter}`}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-[#1A3C2B] text-[#F7F7F5]"
                    : "border border-[rgba(58,58,56,0.2)] text-[rgba(58,58,56,0.55)] hover:border-[#1A3C2B] hover:text-[#1A3C2B]"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {filter === "All" ? "All" : CATEGORY_LABELS[filter]}
              </Link>
            );
          })}
        </div>

        {/* Post list */}
        {posts.length > 0 ? (
          <ol className="divide-y divide-[rgba(58,58,56,0.1)]">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block py-6 transition-colors hover:bg-[rgba(26,60,43,0.03)]"
                >
                  <p
                    className="mb-1.5 text-[10px] uppercase tracking-widest text-[rgba(58,58,56,0.45)]"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                    {" · "}
                    {CATEGORY_LABELS[post.category] ?? post.category}
                    {post.readTime && ` · ${post.readTime}`}
                  </p>
                  <h2 className="text-lg font-semibold text-[#1A3C2B] transition-colors group-hover:text-[#FF8C69]">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-[rgba(58,58,56,0.6)] line-clamp-2">
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
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[rgba(58,58,56,0.4)]">No posts published in this category yet.</p>
        )}
      </div>
    </div>
  );
}
