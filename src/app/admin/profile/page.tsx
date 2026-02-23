import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Profile</h1>
        <p className="mt-1 text-sm text-ink/55">
          Update your public-facing profile and social links.
        </p>
      </div>
      <ProfileForm initialData={profile} />
    </AdminLayout>
  );
}
