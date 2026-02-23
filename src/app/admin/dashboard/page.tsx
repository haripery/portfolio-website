import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getProjects } from "@/actions/projects";
import { getBlogPosts } from "@/actions/blog";
import { getCommentCount } from "@/actions/comments";
import Link from "next/link";
import { FilePlus, FolderPlus, UserCog } from "lucide-react";

export default async function DashboardPage() {
  const [profile, experiences, projects, posts, commentCount] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getBlogPosts(),
    getCommentCount(),
  ]);

  const publishedPosts = posts.filter((p) => p.published);
  const draftPosts = posts.filter((p) => !p.published);
  const featuredProjects = projects.filter((p) => p.featured);

  const stats = [
    { label: "Experience Entries", value: experiences.length, href: "/admin/experience" },
    { label: "Total Projects", value: projects.length, sub: `${featuredProjects.length} featured`, href: "/admin/projects" },
    { label: "Blog Posts", value: posts.length, sub: `${publishedPosts.length} published`, href: "/admin/blog" },
    { label: "Drafts", value: draftPosts.length, href: "/admin/blog" },
    { label: "Comments", value: commentCount, href: "/admin/comments" },
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
        <h1 className="text-2xl font-bold text-forest" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>Dashboard</h1>
        <p className="mt-1 text-sm text-ink/55">
          Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="border border-ink/12 bg-card p-4 transition-colors hover:border-ink/25"
            style={{ borderRadius: "2px" }}
          >
            <p className="text-2xl font-bold text-forest">{value}</p>
            <p className="mt-1 text-xs font-medium text-ink/55">{label}</p>
            {sub && <p className="text-xs text-ink/40">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2
          className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/45"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 border border-ink/18 bg-card px-4 py-2 text-sm font-medium text-ink/65 transition-colors hover:border-forest hover:text-forest"
              style={{ borderRadius: "2px" }}
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
          <h2
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/45"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Recent Posts
          </h2>
          <div className="overflow-hidden border border-ink/12" style={{ borderRadius: "2px" }}>
            <ul className="divide-y divide-ink/8">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="flex items-center justify-between bg-card px-4 py-3 transition-colors hover:bg-ink/3"
                  >
                    <span className="text-sm text-forest">{post.title}</span>
                    <span
                      className={`text-xs ${
                        post.published ? "text-coral" : "text-ink/40"
                      }`}
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
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
