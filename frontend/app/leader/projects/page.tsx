"use client";

import { Card } from "@/components/ui/Card";
import { FolderKanban, MoreVertical, PlayCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

interface Project {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/projects", {
          headers: {
            "Authorization": `Bearer ${getToken()}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">All Projects</h1>
          <p className="text-slate-500 mt-2">Manage and track your automated AI projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-slate-500">No projects found. Create one to get started.</p>
        ) : projects.map((project) => (
          <Card key={project.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
                  <p className="text-sm text-slate-500">Started on {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-700 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="font-bold text-indigo-600">{0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-white">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full rounded-full" 
                  style={{ width: `0%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/40">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                project.status === "In Progress" || project.status === "ongoing" ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {project.status}
              </span>
              <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <PlayCircle size={16} />
                View Details
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
