import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold text-forest"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Sign in to manage your site content
          </p>
        </div>
        <div className="border border-ink/15 bg-card p-6" style={{ borderRadius: "2px" }}>
          <LoginForm />
        </div>
        <p
          className="mt-4 text-center text-xs text-ink/35"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          nearthesingularity.com admin
        </p>
      </div>
    </div>
  );
}
