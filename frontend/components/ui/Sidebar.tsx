"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, FileText, Presentation } from "lucide-react";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const leaderLinks = [
    { name: "Dashboard", href: "/leader/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/leader/projects", icon: FolderKanban },
    { name: "Assign Tasks", href: "/leader/assign-tasks", icon: CheckSquare },
    { name: "Workflow", href: "/leader/workflow", icon: LayoutDashboard },
    { name: "Progress", href: "/leader/progress", icon: BarChart3 },
    { name: "Summary", href: "/leader/summary", icon: FileText },
    { name: "PPT", href: "/leader/ppt", icon: Presentation }
  ];

  const memberLinks = [
    { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/member/tasks", icon: CheckSquare },
    { name: "Progress", href: "/member/progress", icon: BarChart3 }
  ];

  const roleUpper = String(role || "").toUpperCase();
  const isLeader = roleUpper === "TEAM_LEADER" || roleUpper === "LEADER";
  const links = isLeader ? leaderLinks : memberLinks;

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen fixed left-0 top-0 p-6 flex flex-col gap-8 z-50 pointer-events-none"
    >
      <div className="glass w-full h-full rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative pointer-events-auto overflow-hidden border border-white/40">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 tracking-tight">
            HackFlow AI
          </h1>
        </div>

        <nav className="relative z-10 flex-1 flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 text-indigo-700" 
                      : "text-slate-500 hover:bg-white/40 hover:text-indigo-600"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-indigo-600" : ""} />
                  <span className="font-semibold text-sm">{link.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
}
