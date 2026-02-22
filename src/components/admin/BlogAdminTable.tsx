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
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-10 text-center">
        <p className="text-slate-400">No blog posts yet.</p>
        <Link
          href="/admin/blog/new"
          className="mt-4 inline-block text-sm text-teal-400 hover:underline"
        >
          Create your first post →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/50">
          <tr className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
            <th className="px-4 py-3">Title</th>
            <th className="hidden px-4 py-3 md:table-cell">Category</th>
            <th className="hidden px-4 py-3 lg:table-cell">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          {posts.map((post) => (
            <tr
              key={post.id}
              className={`transition-colors hover:bg-slate-800/40 ${
                isPending ? "opacity-60" : ""
              }`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-white">{post.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 font-mono">
                  /{post.slug}
                </p>
              </td>
              <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </td>
              <td className="hidden px-4 py-3 text-slate-400 lg:table-cell whitespace-nowrap">
                {post.publishedAt
                  ? formatDate(post.publishedAt)
                  : formatDate(post.createdAt)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    post.published
                      ? "bg-teal-400/10 text-teal-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
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
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
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
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <ConfirmDialog
                    trigger={
                      <button
                        title="Delete"
                        className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
