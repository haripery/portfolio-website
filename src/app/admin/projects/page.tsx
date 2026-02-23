import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProjects } from "@/actions/projects";
import { ProjectsManager } from "@/components/admin/ProjectsManager";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A3C2B]">Projects</h1>
        <p className="mt-1 text-sm text-[rgba(58,58,56,0.55)]">
          Manage your portfolio projects.
        </p>
      </div>
      <ProjectsManager initialData={projects} />
    </AdminLayout>
  );
}
