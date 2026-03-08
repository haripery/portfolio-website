"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createComment, getCommentsByPostId } from "@/actions/comments";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import posthog from "posthog-js";

const CHAR_LIMIT = 2000;

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
};

export function CommentSectionClient({
  blogPostId,
  initialComments,
}: {
  blogPostId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const charsRemaining = CHAR_LIMIT - body.length;

  const refreshComments = useCallback(async () => {
    const fresh = await getCommentsByPostId(blogPostId);
    setComments(fresh);
  }, [blogPostId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement)
      ?.value;

    startTransition(async () => {
      const result = await createComment({
        body,
        blogPostId,
        website: honeypot ?? "",
      });

      if (result.success) {
        // Optimistic: add the comment to the list immediately
        const optimistic: Comment = {
          id: `optimistic-${Date.now()}`,
          body,
          createdAt: new Date(),
        };
        setComments((prev) => [...prev, optimistic]);
        setBody("");
        toast.success("Comment posted");
        posthog.capture("comment_submitted", { blog_post_id: blogPostId });

        // Then fetch the real list from the server
        await refreshComments();
      } else {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : "Failed to post comment";
        toast.error(errorMsg);
      }
    });
  }

  return (
    <section className="mt-16 pt-8 border-t border-ink/15">
      <h2
        className="mb-6 text-xs font-semibold uppercase tracking-widest text-ink/45"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {comments.length > 0 ? (
        <ul className="mb-8 space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="border border-ink/10 bg-card px-4 py-3"
              style={{ borderRadius: "2px" }}
            >
              <p className="text-sm text-forest whitespace-pre-wrap break-words">
                {comment.body}
              </p>
              <p
                className="mt-2 text-[10px] text-ink/40"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {formatDate(comment.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 text-sm text-ink/45">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          maxLength={CHAR_LIMIT}
          rows={3}
          required
          disabled={isPending}
          className="w-full border border-ink/15 bg-card px-3 py-2 text-sm text-forest placeholder:text-ink/40 focus:border-forest focus:outline-none disabled:opacity-50 resize-y"
          style={{ borderRadius: "2px" }}
        />

        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute opacity-0 h-0 w-0 pointer-events-none"
        />

        <div className="flex items-center justify-between">
          <p
            className={`text-xs ${
              charsRemaining < 100 ? "text-coral" : "text-ink/40"
            }`}
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {charsRemaining} characters remaining
          </p>
          <button
            type="submit"
            disabled={isPending || body.trim().length === 0}
            className="bg-forest px-4 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-forest/80 disabled:opacity-50"
            style={{ borderRadius: "2px" }}
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </section>
  );
}
