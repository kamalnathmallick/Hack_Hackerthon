"use client";

import { Card } from "@/components/ui/Card";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

export default function MemberDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 mt-1">Here are your assigned AI project modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col gap-4 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Frontend Task</h3>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">High Priority</span>
          </div>
          <p className="text-slate-600">Implement Frontend related modules for Healthcare Automation.</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-semibold text-slate-500">Project: Healthcare Automation</span>
            <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              <PlayCircle size={16} /> Update Progress
            </button>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 border-l-4 border-l-emerald-500 opacity-70">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">API Integration</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">Completed</span>
          </div>
          <p className="text-slate-600">Integrate REST endpoints for project creation.</p>
        </Card>
      </div>
    </div>
  );
}
