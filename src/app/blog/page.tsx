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
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#5eead4] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-[#e2e8f0] mb-2">
          Writing
        </h1>
        <p className="text-[#94a3b8] mb-10">
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
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#5eead4] text-[#0f172a]"
                    : "bg-[#1e293b] text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#334155]"
                }`}
              >
                {filter === "All" ? "All" : CATEGORY_LABELS[filter]}
              </Link>
            );
          })}
        </div>

        {/* Post list */}
        {posts.length > 0 ? (
          <ol className="space-y-8">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-lg p-4 transition-all hover:bg-[rgba(30,41,59,0.5)] hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]"
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                    {" · "}
                    {CATEGORY_LABELS[post.category] ?? post.category}
                    {post.readTime && ` · ${post.readTime}`}
                  </p>
                  <h2 className="text-lg font-semibold text-[#e2e8f0] transition-colors group-hover:text-[#5eead4]">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-[#94a3b8] line-clamp-2">
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
          <p className="text-[#64748b]">No posts published in this category yet.</p>
        )}
      </div>
    </div>
  );
}
