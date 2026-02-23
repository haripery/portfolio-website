"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteComment } from "@/actions/comments";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Trash2, ExternalLink } from "lucide-react";
import type { CommentWithPost } from "@/types";

export function CommentsAdminTable({ comments }: { comments: CommentWithPost[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteComment(id);
      if (result.success) toast.success("Comment deleted");
      else toast.error("Failed to delete comment");
    });
  }

  if (comments.length === 0) {
    return (
      <div className="border border-ink/12 bg-card p-10 text-center" style={{ borderRadius: "2px" }}>
        <p className="text-ink/55">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-ink/12" style={{ borderRadius: "2px" }}>
      <table className="w-full text-sm">
        <thead className="bg-ink/4">
          <tr
            className="text-left text-xs font-semibold uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <th className="px-4 py-3">Comment</th>
            <th className="hidden px-4 py-3 md:table-cell">Post</th>
            <th className="hidden px-4 py-3 lg:table-cell">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8 bg-card">
          {comments.map((comment) => (
            <tr
              key={comment.id}
              className={`transition-colors hover:bg-ink/3 ${
                isPending ? "opacity-60" : ""
              }`}
            >
              <td className="px-4 py-3 max-w-xs">
                <p className="text-forest truncate">{comment.body}</p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <Link
                  href={`/blog/${comment.blogPost.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-ink/55 hover:text-forest transition-colors"
                >
                  <span className="truncate max-w-[200px]">{comment.blogPost.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-ink/55 lg:table-cell whitespace-nowrap">
                {formatDate(comment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end">
                  <ConfirmDialog
                    trigger={
                      <button
                        title="Delete comment"
                        className="p-1.5 text-ink/45 hover:bg-red-50 hover:text-red-500 transition-colors"
                        style={{ borderRadius: "2px" }}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                    title="Delete comment?"
                    description="This comment will be permanently removed."
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(comment.id)}
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
