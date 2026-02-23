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
              <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
                placeholder="Post title"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B] resize-none"
                placeholder="Short summary displayed in post listings…"
              />
            </div>

            {/* Rich text editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                  Content
                </label>
                <button
                  type="button"
                  onClick={() => setSourceMode(!sourceMode)}
                  className="text-xs font-mono px-2 py-1 border border-[rgba(58,58,56,0.2)] text-[rgba(58,58,56,0.5)] hover:text-[#1A3C2B] hover:border-[#1A3C2B] transition-colors"
                >
                  {sourceMode ? "Visual Editor" : "HTML Source"}
                </button>
              </div>
              {sourceMode ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm font-mono text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B] resize-y"
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
            <div className="border border-[rgba(58,58,56,0.15)] bg-[rgba(58,58,56,0.03)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[rgba(58,58,56,0.75)]">
                  Status
                </span>
                <span
                  className={`text-xs font-semibold ${
                    published ? "text-[#FF8C69]" : "text-[rgba(58,58,56,0.4)]"
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
                  className="flex-1 border border-[rgba(58,58,56,0.2)] py-1.5 text-sm text-[rgba(58,58,56,0.6)] hover:bg-[rgba(58,58,56,0.06)] transition-colors disabled:opacity-50"
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
                  className="flex-1 bg-[#1A3C2B] py-1.5 text-sm font-semibold text-white hover:bg-[#1D4531] transition-colors disabled:opacity-50"
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
              <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as typeof category)
                }
                className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
              >
                <option value="LEARNINGS">My Learnings</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="AI">AI Explorations</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                Tags
              </label>
              <TagInput value={tags} onChange={setTags} />
            </div>

            {/* Read time */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
                Read time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
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
            className="border border-[rgba(58,58,56,0.2)] px-4 py-2 text-sm text-[rgba(58,58,56,0.6)] hover:bg-[rgba(58,58,56,0.06)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
