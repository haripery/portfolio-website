"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { TagInput } from "./TagInput";
import { SlugInput } from "./SlugInput";
import { ImageUploader } from "./ImageUploader";
import { createBlogPost, updateBlogPost } from "@/actions/blog";
import toast from "react-hot-toast";
import type { BlogPost, BlogTag } from "@/generated/prisma/client";

type InitialData = BlogPost & { tags: BlogTag[] };

export function BlogPostForm({
  initialData,
}: {
  initialData?: InitialData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [contentJson, setContentJson] = useState(
    initialData?.contentJson ?? "{}"
  );
  const [category, setCategory] = useState<"LEARNINGS" | "MENTORSHIP" | "AI">(
    (initialData?.category as "LEARNINGS" | "MENTORSHIP" | "AI") ?? "LEARNINGS"
  );
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags.map((t) => t.label) ?? []
  );
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [readTime, setReadTime] = useState(initialData?.readTime ?? "");
  const [sourceMode, setSourceMode] = useState(false);

  function handleEditorChange(html: string, json: string) {
    setContent(html);
    setContentJson(json);
  }

  async function handleSubmit(
    e: React.FormEvent,
    publishNow?: boolean
  ) {
    e.preventDefault();

    const payload = {
      title,
      slug,
      excerpt,
      content,
      contentJson,
      category,
      coverImage,
      tags,
      readTime,
      published: publishNow ?? published,
      featured: initialData?.featured ?? false,
    };

    startTransition(async () => {
      const result = initialData
        ? await updateBlogPost(initialData.id, payload)
        : await createBlogPost(payload);

      if (result.success) {
        toast.success(
          initialData ? "Post updated successfully!" : "Post created!"
        );
        router.push("/admin/blog");
        router.refresh();
      } else {
        toast.error("Failed to save. Please check all required fields.");
        console.error(result.error);
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ── EDITOR (main area) ── */}
          <div className="flex-1 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink/75">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-ink/20 bg-card px-3 py-2 text-forest placeholder:text-ink/35 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                placeholder="Post title"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink/75">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full border border-ink/20 bg-card px-3 py-2 text-sm text-forest placeholder:text-ink/35 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest resize-none"
                placeholder="Short summary displayed in post listings…"
              />
            </div>

            {/* Rich text editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink/75">
                  Content
                </label>
                <button
                  type="button"
                  onClick={() => setSourceMode(!sourceMode)}
                  className="text-xs font-mono px-2 py-1 border border-ink/20 text-ink/50 hover:text-forest hover:border-forest transition-colors"
                >
                  {sourceMode ? "Visual Editor" : "HTML Source"}
                </button>
              </div>
              {sourceMode ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full border border-ink/20 bg-card px-3 py-2 text-sm font-mono text-forest placeholder:text-ink/35 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest resize-y"
                  placeholder="Paste raw HTML here…"
                />
              ) : (
                <RichTextEditor
                  content={content || initialData?.content}
                  onChange={handleEditorChange}
                />
              )}
            </div>
          </div>

          {/* ── SIDEBAR (settings) ── */}
          <aside className="w-full lg:w-72 space-y-5">
            {/* Publish actions */}
            <div className="border border-ink/15 bg-ink/3 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink/75">
                  Status
                </span>
                <span
                  className={`text-xs font-semibold ${
                    published ? "text-coral" : "text-ink/40"
                  }`}
                >
                  {published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={(e) => {
                    setPublished(false);
                    handleSubmit(e as unknown as React.FormEvent, false);
                  }}
                  className="flex-1 border border-ink/20 py-1.5 text-sm text-ink/60 hover:bg-ink/6 transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={(e) => {
                    setPublished(true);
                    handleSubmit(e as unknown as React.FormEvent, true);
                  }}
                  className="flex-1 bg-forest py-1.5 text-sm font-semibold text-white hover:bg-forest/80 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving…" : published ? "Update" : "Publish"}
                </button>
              </div>
            </div>

            {/* Slug */}
            <SlugInput
              title={title}
              value={slug}
              onChange={setSlug}
              disabled={!!initialData}
            />

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink/75">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as typeof category)
                }
                className="w-full border border-ink/20 bg-card px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="LEARNINGS">My Learnings</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="AI">AI Explorations</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink/75">
                Tags
              </label>
              <TagInput value={tags} onChange={setTags} />
            </div>

            {/* Read time */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink/75">
                Read time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full border border-ink/20 bg-card px-3 py-2 text-sm text-forest placeholder:text-ink/35 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                placeholder="e.g. 8 min read"
              />
            </div>

            {/* Cover image */}
            <ImageUploader
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="blog-covers"
            />
          </aside>
        </div>

        {/* Cancel button */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="border border-ink/20 px-4 py-2 text-sm text-ink/60 hover:bg-ink/6 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
