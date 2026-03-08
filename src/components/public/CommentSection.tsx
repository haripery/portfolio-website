import { getCommentsByPostId } from "@/actions/comments";
import { CommentSectionClient } from "./CommentSectionClient";

export async function CommentSection({
  blogPostId,
}: {
  blogPostId: string;
}) {
  const comments = await getCommentsByPostId(blogPostId);

  return (
    <CommentSectionClient blogPostId={blogPostId} initialComments={comments} />
  );
}
