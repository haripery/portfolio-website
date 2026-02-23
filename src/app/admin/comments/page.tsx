import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAllComments } from "@/actions/comments";
import { CommentsAdminTable } from "@/components/admin/CommentsAdminTable";

export default async function AdminCommentsPage() {
  const comments = await getAllComments();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Comments</h1>
        <p className="mt-1 text-sm text-ink/55">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </p>
      </div>
      <CommentsAdminTable comments={comments} />
    </AdminLayout>
  );
}
