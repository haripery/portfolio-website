import { AdminLayout } from "@/components/admin/AdminLayout";
import { getSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">
          Manage site metadata, analytics, and your admin password.
        </p>
      </div>
      <SettingsForm initialData={settings} />
    </AdminLayout>
  );
}
