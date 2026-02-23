import { AdminLayout } from "@/components/admin/AdminLayout";
import { getBlogPostById } from "@/actions/blog";
import { notFound } from "next/navigation";
import { BlogEditorWrapper } from "@/components/admin/BlogEditorWrapper";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) notFound();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Edit Post</h1>
        <p className="mt-1 text-sm text-ink/55">
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>
      <BlogEditorWrapper initialData={post} />
    </AdminLayout>
  );
}
