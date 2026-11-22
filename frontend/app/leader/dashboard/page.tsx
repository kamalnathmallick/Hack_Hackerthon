"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Activity, Briefcase, Users, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LeaderDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 3,
    totalMembers: 12,
    completedTasks: 45
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is what is happening with your projects today.</p>
        </div>
        <Link href="/leader/create-project">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 font-semibold"
          >
            <PlusCircle size={20} />
            Create Project
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Projects</p>
              <h2 className="text-2xl font-bold text-slate-800">{stats.activeProjects}</h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Team Members</p>
              <h2 className="text-2xl font-bold text-slate-800">{stats.totalMembers}</h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
              <h2 className="text-2xl font-bold text-slate-800">{stats.completedTasks}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activity</h2>
        <Card className="p-0">
          <div className="divide-y divide-white/40">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-6 flex items-center gap-4 hover:bg-white/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Activity size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">Task "API Integration" was completed</p>
                  <p className="text-sm text-slate-500">2 hours ago in Project Alpha</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
