"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Project } from "@/lib/types";

export default function LeaderSummaryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");

  async function loadSummary(id: number) {
    const res = await apiRequest<{ summaryText: string }>(`/projects/${id}/summary`);
    setSummary(res.data.summaryText || "");
  }

  useEffect(() => {
    (async () => {
      const res = await apiRequest<Project[]>("/projects");
      setProjects(res.data);
      if (res.data.length) {
        setProjectId(res.data[0].id);
        loadSummary(res.data[0].id);
      }
    })();
  }, []);

  async function regenerate() {
    if (!projectId) return;
    const res = await apiRequest<{ summaryText: string }>(`/projects/${projectId}/summary`, {
      method: "POST"
    });
    setSummary(res.data.summaryText);
    setMessage("Summary generated.");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Project Summary</h2>
      <div className="rounded-xl border bg-white p-4">
        <label className="text-sm">
          Project
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={projectId || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setProjectId(id);
              loadSummary(id);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <button onClick={regenerate} className="mt-3 rounded bg-sky-700 px-3 py-2 text-white">
          Generate Summary
        </button>
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
      </div>
      <div className="rounded-xl border bg-white p-4">
        <pre className="whitespace-pre-wrap text-sm">{summary || "No summary yet."}</pre>
      </div>
    </div>
  );
}
