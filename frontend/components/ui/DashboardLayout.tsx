"use client";

import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";

export function DashboardLayout({ children, role }: { children: ReactNode, role: "TEAM_LEADER" | "TEAM_MEMBER" | "leader" | "member" }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const user = getUser();
    const userRole = String(user?.role || "").toUpperCase();
    const targetRole = (role === "leader" || role === "TEAM_LEADER") ? "TEAM_LEADER" : "TEAM_MEMBER";
    const normalizedUserRole = (userRole === "LEADER" || userRole === "TEAM_LEADER") ? "TEAM_LEADER" : "TEAM_MEMBER";

    if (normalizedUserRole !== targetRole) {
      // Block access if role mismatch
      router.push("/login");
      return;
    }

    setAuthorized(true);
  }, [role, router]);

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Loading...</div>;
  }
  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Orbs for extra 3D pop */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      
      <Sidebar role={role} />
      <Topbar />
      
      <main className="ml-64 pt-24 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
