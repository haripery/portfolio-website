import { AdminLayout } from "@/components/admin/AdminLayout";
import { BlogEditorWrapper } from "@/components/admin/BlogEditorWrapper";

export default function NewBlogPostPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">New Post</h1>
        <p className="mt-1 text-sm text-ink/55">
          Write and publish a new blog post.
        </p>
      </div>
      <BlogEditorWrapper />
    </AdminLayout>
  );
}
