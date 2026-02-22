import { getBlogPost, getBlogPosts } from "@/actions/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { TagPill } from "@/components/public/TagPill";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts({ published: true });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.excerpt || undefined,
    };
  } catch {
    return {};
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  LEARNINGS: "My Learnings",
  MENTORSHIP: "Mentorship",
  AI: "AI Explorations",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || !post.published) notFound();

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <div className="mx-auto max-w-2xl px-6 py-16 md:px-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#5eead4] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Posts
        </Link>

        {/* Post header */}
        <header className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
            {post.publishedAt ? formatDate(post.publishedAt) : ""}
            {post.category && (
              <>
                {" · "}
                <Link
                  href={`/blog?category=${post.category}`}
                  className="text-[#5eead4] hover:underline"
                >
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </Link>
              </>
            )}
            {post.readTime && ` · ${post.readTime}`}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#e2e8f0] md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-lg text-[#94a3b8] leading-relaxed">
              {post.excerpt}
            </p>
          )}
          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag.id}>
                  <TagPill label={tag.label} />
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* Cover image */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mb-10 w-full rounded-lg border border-white/10"
          />
        )}

        {/* Post content — rendered Tiptap HTML */}
        <div
          className="prose prose-invert max-w-none
            prose-headings:text-[#e2e8f0] prose-headings:font-bold
            prose-p:text-[#94a3b8] prose-p:leading-relaxed
            prose-a:text-[#5eead4] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#e2e8f0] prose-strong:font-semibold
            prose-em:text-[#94a3b8]
            prose-code:bg-[#1e293b] prose-code:text-[#5eead4] prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#1e293b] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
            prose-blockquote:border-l-[#5eead4] prose-blockquote:text-[#94a3b8]
            prose-hr:border-[#1e293b]
            prose-li:text-[#94a3b8]
            prose-ul:text-[#94a3b8]
            prose-ol:text-[#94a3b8]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#5eead4] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
