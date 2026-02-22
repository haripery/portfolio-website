import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage your site content
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          nearthesingularity.com admin
        </p>
      </div>
    </div>
  );
}
