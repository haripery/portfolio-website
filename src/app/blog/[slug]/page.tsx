import { getBlogPost, getBlogPosts } from "@/actions/blog";
import { getProfile } from "@/actions/profile";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { TagPill } from "@/components/public/TagPill";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { TwitterEmbed } from "@/components/public/TwitterEmbed";
import { BlogPostTracker } from "@/components/public/BlogPostTracker";
import { CommentSection } from "@/components/public/CommentSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButtons } from "@/components/public/ShareButtons";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

    const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;

    return {
      title: post.title,
      description: post.excerpt || undefined,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        title: post.title,
        description: post.excerpt || undefined,
        url: canonicalUrl,
        images: post.coverImage ? [post.coverImage] : [],
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        tags: post.tags.map((t) => t.label),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || undefined,
        images: post.coverImage ? [post.coverImage] : [],
      },
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
  const [post, profile] = await Promise.all([
    getBlogPost(slug),
    getProfile(),
  ]);

  if (!post || !post.published) notFound();

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: profile
      ? { "@type": "Person", name: profile.name, url: BASE_URL }
      : undefined,
    keywords: post.tags.map((t) => t.label),
    articleSection: CATEGORY_LABELS[post.category] ?? post.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen mosaic-bg text-forest">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-16">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-3 w-3" />
            All Posts
          </Link>
          <ThemeToggle />
        </div>

        {/* Post header */}
        <header className="mb-10">
          <p
            className="mb-3 text-[10px] uppercase tracking-widest text-ink/45"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {post.publishedAt ? formatDate(post.publishedAt) : ""}
            {post.category && (
              <>
                {" · "}
                <Link
                  href={`/blog?category=${post.category}`}
                  className="text-coral hover:underline"
                >
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </Link>
              </>
            )}
            {post.readTime && ` · ${post.readTime}`}
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-forest md:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-base text-ink/65 leading-relaxed">
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

        <ShareButtons
          url={`${BASE_URL}/blog/${post.slug}`}
          title={post.title}
          slug={post.slug}
        />

        {/* Cover image */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mb-10 w-full border border-ink/15"
          />
        )}

        {/* Post content — rendered Tiptap HTML */}
        <div
          className="prose prose-site max-w-none overflow-x-hidden"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Load Twitter widgets.js to render embedded tweets — key forces remount on navigation */}
        <TwitterEmbed key={post.slug} />
        <BlogPostTracker
          slug={post.slug}
          title={post.title}
          category={post.category}
          tags={post.tags.map((t) => t.label)}
        />

        {/* Comments */}
        <CommentSection blogPostId={post.id} />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-ink/15">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
