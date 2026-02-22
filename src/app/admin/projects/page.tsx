import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProjects } from "@/actions/projects";
import { ProjectsManager } from "@/components/admin/ProjectsManager";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your portfolio projects.
        </p>
      </div>
      <ProjectsManager initialData={projects} />
    </AdminLayout>
  );
}
