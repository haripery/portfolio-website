import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getProjects } from "@/actions/projects";
import { getBlogPosts } from "@/actions/blog";
import Link from "next/link";
import { FilePlus, FolderPlus, UserCog } from "lucide-react";

export default async function DashboardPage() {
  const [profile, experiences, projects, posts] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getBlogPosts(),
  ]);

  const publishedPosts = posts.filter((p) => p.published);
  const draftPosts = posts.filter((p) => !p.published);
  const featuredProjects = projects.filter((p) => p.featured);

  const stats = [
    { label: "Experience Entries", value: experiences.length, href: "/admin/experience" },
    { label: "Total Projects", value: projects.length, sub: `${featuredProjects.length} featured`, href: "/admin/projects" },
    { label: "Blog Posts", value: posts.length, sub: `${publishedPosts.length} published`, href: "/admin/blog" },
    { label: "Drafts", value: draftPosts.length, href: "/admin/blog" },
  ];

  const quickActions = [
    { label: "New Blog Post", href: "/admin/blog/new", Icon: FilePlus },
    { label: "Add Project", href: "/admin/projects", Icon: FolderPlus },
    { label: "Edit Profile", href: "/admin/profile", Icon: UserCog },
  ];

  const recentPosts = posts.slice(0, 5);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700"
          >
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
            {sub && <p className="text-xs text-slate-600">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-teal-500/50 hover:text-teal-400"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Recent Posts
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <ul className="divide-y divide-slate-800">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-800/50"
                  >
                    <span className="text-sm text-slate-300">{post.title}</span>
                    <span
                      className={`text-xs ${
                        post.published ? "text-teal-400" : "text-slate-500"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
