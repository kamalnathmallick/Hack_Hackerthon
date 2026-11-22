"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Project } from "@/lib/types";
import WorkflowViewer from "@/components/WorkflowViewer";

interface WorkflowData {
  steps: string[];
  status: Record<string, string>;
}

export default function LeaderWorkflowPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [message, setMessage] = useState("");

  async function loadProjects() {
    const res = await apiRequest<Project[]>("/projects");
    setProjects(res.data);
    if (res.data.length && !projectId) {
      setProjectId(res.data[0].id);
    }
  }

  async function loadWorkflow(id: number) {
    const res = await apiRequest<WorkflowData>(`/workflow/${id}`);
    setWorkflow(res.data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) loadWorkflow(projectId);
  }, [projectId]);

  async function regenerate() {
    if (!projectId) return;
    await apiRequest("/workflow/generate", {
      method: "POST",
      body: JSON.stringify({ projectId })
    });
    setMessage("Workflow regenerated.");
    await loadWorkflow(projectId);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Workflow</h2>
      <div className="rounded-xl border bg-white p-4">
        <label className="text-sm">
          Select Project
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={projectId || ""}
            onChange={(e) => setProjectId(Number(e.target.value))}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <button className="mt-3 rounded bg-sky-700 px-3 py-2 text-white" onClick={regenerate} disabled={!projectId}>
          Generate Workflow
        </button>
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
      </div>

      {workflow && <WorkflowViewer steps={workflow.steps} status={workflow.status} />}
    </div>
  );
}
