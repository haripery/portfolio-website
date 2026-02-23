"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/actions/comments";
import toast from "react-hot-toast";

const CHAR_LIMIT = 2000;

export function CommentForm({ blogPostId }: { blogPostId: string }) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const charsRemaining = CHAR_LIMIT - body.length;

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
        setBody("");
        toast.success("Comment posted");
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
  );
}
