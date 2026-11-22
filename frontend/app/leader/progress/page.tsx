"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Project } from "@/lib/types";

interface Progress {
  progress_value: number;
  note: string;
}

export default function LeaderProgressPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await apiRequest<Project[]>("/projects");
      setProjects(res.data);
      if (res.data.length) setProjectId(res.data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const res = await apiRequest<Progress>(`/projects/${projectId}/progress`);
      setProgress(res.data);
      setProgressValue(res.data.progress_value);
      setNote(res.data.note || "");
    })();
  }, [projectId]);

  async function updateProgress(e: FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    const res = await apiRequest<Progress>(`/projects/${projectId}/progress`, {
      method: "POST",
      body: JSON.stringify({ progressValue, note })
    });
    setProgress(res.data);
    setMessage("Progress updated.");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Project Progress</h2>
      <form onSubmit={updateProgress} className="space-y-3 rounded-xl border bg-white p-4">
        <label className="block text-sm">
          Project
          <select className="mt-1 w-full rounded border px-3 py-2" value={projectId || ""} onChange={(e) => setProjectId(Number(e.target.value))}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Progress Value (%)
          <input
            type="number"
            min={0}
            max={100}
            value={progressValue}
            onChange={(e) => setProgressValue(Number(e.target.value))}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Note
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 min-h-20 w-full rounded border px-3 py-2" />
        </label>
        <button className="rounded bg-sky-700 px-4 py-2 text-white">Save Progress</button>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
      </form>

      {progress && (
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-700">
          Current progress: <strong>{progress.progress_value}%</strong>
          <p className="mt-1">Note: {progress.note || "No note yet."}</p>
        </div>
      )}
    </div>
  );
}
