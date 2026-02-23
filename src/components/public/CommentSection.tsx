import { getCommentsByPostId } from "@/actions/comments";
import { CommentForm } from "./CommentForm";
import { formatDate } from "@/lib/utils";

export async function CommentSection({
  blogPostId,
}: {
  blogPostId: string;
}) {
  const comments = await getCommentsByPostId(blogPostId);

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

      <CommentForm blogPostId={blogPostId} />
    </section>
  );
}
