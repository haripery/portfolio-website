"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteBlogPost, toggleBlogPostPublished } from "@/actions/blog";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { BlogPostWithTags } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  LEARNINGS: "Learnings",
  MENTORSHIP: "Mentorship",
  AI: "AI",
};

export function BlogAdminTable({ posts }: { posts: BlogPostWithTags[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result.success) toast.success("Post deleted");
      else toast.error("Failed to delete post");
    });
  }

  function handleTogglePublish(id: string, published: boolean) {
    startTransition(async () => {
      const result = await toggleBlogPostPublished(id, !published);
      if (result.success)
        toast.success(!published ? "Post published" : "Post unpublished");
      else toast.error("Failed to update status");
    });
  }

  if (posts.length === 0) {
    return (
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-10 text-center" style={{ borderRadius: "2px" }}>
        <p className="text-[rgba(58,58,56,0.55)]">No blog posts yet.</p>
        <Link
          href="/admin/blog/new"
          className="mt-4 inline-block text-sm text-[#FF8C69] hover:underline"
        >
          Create your first post →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[rgba(58,58,56,0.12)]" style={{ borderRadius: "2px" }}>
      <table className="w-full text-sm">
        <thead className="bg-[rgba(58,58,56,0.04)]">
          <tr
            className="text-left text-xs font-semibold uppercase tracking-widest text-[rgba(58,58,56,0.5)]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <th className="px-4 py-3">Title</th>
            <th className="hidden px-4 py-3 md:table-cell">Category</th>
            <th className="hidden px-4 py-3 lg:table-cell">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(58,58,56,0.08)] bg-white">
          {posts.map((post) => (
            <tr
              key={post.id}
              className={`transition-colors hover:bg-[rgba(58,58,56,0.03)] ${
                isPending ? "opacity-60" : ""
              }`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-[#1A3C2B]">{post.title}</p>
                <p
                  className="mt-0.5 text-xs text-[rgba(58,58,56,0.4)] font-mono"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  /{post.slug}
                </p>
              </td>
              <td className="hidden px-4 py-3 text-[rgba(58,58,56,0.55)] md:table-cell">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </td>
              <td className="hidden px-4 py-3 text-[rgba(58,58,56,0.55)] lg:table-cell whitespace-nowrap">
                {post.publishedAt
                  ? formatDate(post.publishedAt)
                  : formatDate(post.createdAt)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                    post.published
                      ? "bg-[rgba(26,60,43,0.08)] text-[#1A3C2B]"
                      : "bg-[rgba(58,58,56,0.08)] text-[rgba(58,58,56,0.5)]"
                  }`}
                  style={{ borderRadius: "2px", fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() =>
                      handleTogglePublish(post.id, post.published)
                    }
                    title={
                      post.published ? "Unpublish" : "Publish"
                    }
                    className="p-1.5 text-[rgba(58,58,56,0.45)] hover:bg-[rgba(58,58,56,0.08)] hover:text-[#1A3C2B] transition-colors"
                    style={{ borderRadius: "2px" }}
                    disabled={isPending}
                  >
                    {post.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="p-1.5 text-[rgba(58,58,56,0.45)] hover:bg-[rgba(58,58,56,0.08)] hover:text-[#1A3C2B] transition-colors"
                    style={{ borderRadius: "2px" }}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <ConfirmDialog
                    trigger={
                      <button
                        title="Delete"
                        className="p-1.5 text-[rgba(58,58,56,0.45)] hover:bg-red-50 hover:text-red-500 transition-colors"
                        style={{ borderRadius: "2px" }}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                    title="Delete post?"
                    description={`"${post.title}" will be permanently deleted.`}
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(post.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
