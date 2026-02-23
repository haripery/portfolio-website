"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validators";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data = {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError("Please enter a valid email and password (min. 8 characters).");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push("/admin/dashboard");
        router.refresh();
      }
    });
  }

  const inputClass =
    "w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="border border-red-400/30 bg-red-50 px-4 py-3 text-sm text-red-600" style={{ borderRadius: "2px" }}>
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          style={{ borderRadius: "2px" }}
          placeholder="admin@nearthesingularity.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${inputClass} pr-10`}
            style={{ borderRadius: "2px" }}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(58,58,56,0.4)] hover:text-[#1A3C2B]"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#1A3C2B] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderRadius: "2px" }}
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
