import { AdminLayout } from "@/components/admin/AdminLayout";
import { BlogEditorWrapper } from "@/components/admin/BlogEditorWrapper";

export default function NewBlogPostPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A3C2B]">New Post</h1>
        <p className="mt-1 text-sm text-[rgba(58,58,56,0.55)]">
          Write and publish a new blog post.
        </p>
      </div>
      <BlogEditorWrapper />
    </AdminLayout>
  );
}
