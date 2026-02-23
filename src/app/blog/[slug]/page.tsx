import { getBlogPost, getBlogPosts } from "@/actions/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { TagPill } from "@/components/public/TagPill";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { TwitterEmbed } from "@/components/public/TwitterEmbed";

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
    <div className="min-h-screen mosaic-bg text-[#1A3C2B]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[rgba(58,58,56,0.5)] transition-colors hover:text-[#1A3C2B]"
        >
          <ArrowLeft className="h-3 w-3" />
          All Posts
        </Link>

        {/* Post header */}
        <header className="mb-10">
          <p
            className="mb-3 text-[10px] uppercase tracking-widest text-[rgba(58,58,56,0.45)]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {post.publishedAt ? formatDate(post.publishedAt) : ""}
            {post.category && (
              <>
                {" · "}
                <Link
                  href={`/blog?category=${post.category}`}
                  className="text-[#FF8C69] hover:underline"
                >
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </Link>
              </>
            )}
            {post.readTime && ` · ${post.readTime}`}
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-[#1A3C2B] md:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-base text-[rgba(58,58,56,0.65)] leading-relaxed">
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
            className="mb-10 w-full border border-[rgba(58,58,56,0.15)]"
          />
        )}

        {/* Post content — rendered Tiptap HTML */}
        <div
          className="prose max-w-none overflow-x-hidden
            prose-headings:text-[#1A3C2B] prose-headings:font-bold
            prose-p:text-[rgba(58,58,56,0.75)] prose-p:leading-relaxed
            prose-a:text-[#FF8C69] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#1A3C2B] prose-strong:font-semibold
            prose-em:text-[rgba(58,58,56,0.75)]
            prose-code:bg-[rgba(26,60,43,0.07)] prose-code:text-[#1A3C2B] prose-code:rounded-none prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[rgba(26,60,43,0.05)] prose-pre:border prose-pre:border-[rgba(58,58,56,0.15)] prose-pre:rounded-none
            prose-blockquote:border-l-[#FF8C69] prose-blockquote:text-[rgba(58,58,56,0.65)]
            prose-hr:border-[rgba(58,58,56,0.15)]
            prose-li:text-[rgba(58,58,56,0.75)] prose-li:my-0.5
            prose-ul:my-3 prose-ul:text-[rgba(58,58,56,0.75)]
            prose-ol:my-3 prose-ol:text-[rgba(58,58,56,0.75)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Load Twitter widgets.js to render embedded tweets */}
        <TwitterEmbed />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-[rgba(58,58,56,0.15)]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[rgba(58,58,56,0.5)] transition-colors hover:text-[#1A3C2B]"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
