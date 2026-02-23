"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Code2,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", Icon: User },
  { href: "/admin/experience", label: "Experience", Icon: Briefcase },
  { href: "/admin/projects", label: "Projects", Icon: Code2 },
  { href: "/admin/blog", label: "Blog", Icon: BookOpen },
  { href: "/admin/resume", label: "Resume", Icon: FileText },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-card border-r border-ink/12 flex flex-col py-6 shrink-0">
      <div className="px-4 mb-8 flex items-center justify-between">
        <span
          className="text-xs font-bold uppercase tracking-widest text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Admin
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-ink/40 hover:text-forest transition-colors"
            aria-label="View site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-forest/10 text-forest"
                  : "text-ink/55 hover:bg-ink/6 hover:text-forest"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 mt-4 border-t border-ink/12 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-ink/55 hover:text-forest hover:bg-ink/6 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
