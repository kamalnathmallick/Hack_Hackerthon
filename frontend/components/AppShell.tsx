"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import { ReactNode, useMemo } from "react";
import { motion } from "framer-motion";

interface Item {
  href: string;
  label: string;
}

interface Props {
  role: "TEAM_LEADER" | "TEAM_MEMBER";
  children: ReactNode;
}

export default function AppShell({ role, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  const items = useMemo<Item[]>(() => {
    if (role === "TEAM_LEADER") {
      return [
        { href: "/leader/dashboard", label: "Dashboard" },
        { href: "/leader/projects", label: "Projects" },
        { href: "/leader/create-project", label: "Create Project" },
        { href: "/leader/assign-tasks", label: "Assign Tasks" },
        { href: "/leader/workflow", label: "Workflow" },
        { href: "/leader/progress", label: "Progress" },
        { href: "/leader/summary", label: "Summary" },
        { href: "/leader/ppt", label: "PPT" }
      ];
    }
    return [
      { href: "/member/dashboard", label: "Dashboard" },
      { href: "/member/tasks", label: "My Tasks" },
      { href: "/member/progress", label: "Progress" },
      { href: "/member/notifications", label: "Notifications" }
    ];
  }, [role]);

  return (
    <div className="min-h-screen text-brand-text">
      <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">HackFlow AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.name} ({user?.role === "TEAM_LEADER" ? "Team Leader" : "Team Member"})
            </span>
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100"
              onClick={() => {
                clearAuth();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[230px_1fr]">
        <aside className="glass rounded-2xl p-3">
          <nav className="flex flex-col gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-brand-accent text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-4"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
