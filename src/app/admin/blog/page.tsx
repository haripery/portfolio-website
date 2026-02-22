import { AdminLayout } from "@/components/admin/AdminLayout";
import { getBlogPosts } from "@/actions/blog";
import { BlogAdminTable } from "@/components/admin/BlogAdminTable";
import { DocumentToBlogImporter } from "@/components/admin/DocumentToBlogImporter";
import Link from "next/link";
import { FilePlus } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="mt-1 text-sm text-slate-400">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DocumentToBlogImporter />
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400"
          >
            <FilePlus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>
      <BlogAdminTable posts={posts} />
    </AdminLayout>
  );
}
