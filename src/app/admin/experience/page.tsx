import { AdminLayout } from "@/components/admin/AdminLayout";
import { getExperiences } from "@/actions/experience";
import { ExperienceManager } from "@/components/admin/ExperienceManager";

export default async function AdminExperiencePage() {
  const experiences = await getExperiences();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Experience</h1>
        <p className="mt-1 text-sm text-ink/55">
          Manage your work history and career timeline.
        </p>
      </div>
      <ExperienceManager initialData={experiences} />
    </AdminLayout>
  );
}
