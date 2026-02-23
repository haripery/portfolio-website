import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProfile } from "@/actions/profile";
import { ResumeUploadForm } from "@/components/admin/ResumeUploadForm";
import { ResumeAIImporter } from "@/components/admin/ResumeAIImporter";

export default async function AdminResumePage() {
  const profile = await getProfile();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Resume</h1>
        <p className="mt-1 text-sm text-ink/55">
          Upload your resume PDF. It will be linked from the homepage.
        </p>
      </div>
      <ResumeUploadForm currentUrl={profile?.resumeUrl ?? ""} />
      <div className="mt-8">
        <h2 className="mb-1 text-lg font-semibold text-forest">
          AI Experience Import
        </h2>
        <p className="mb-4 text-sm text-ink/55">
          Upload your resume and Claude will extract your work history, letting
          you review and import selected entries directly into the Experience
          section.
        </p>
        <ResumeAIImporter />
      </div>
    </AdminLayout>
  );
}
