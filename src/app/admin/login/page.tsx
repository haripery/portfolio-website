import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold text-[#1A3C2B]"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-[rgba(58,58,56,0.55)]">
            Sign in to manage your site content
          </p>
        </div>
        <div className="border border-[rgba(58,58,56,0.15)] bg-white p-6" style={{ borderRadius: "2px" }}>
          <LoginForm />
        </div>
        <p
          className="mt-4 text-center text-xs text-[rgba(58,58,56,0.35)]"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          nearthesingularity.com admin
        </p>
      </div>
    </div>
  );
}
