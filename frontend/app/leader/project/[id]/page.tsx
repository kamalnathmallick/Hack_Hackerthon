"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Project, Task } from "@/lib/types";
import WorkflowViewer from "@/components/WorkflowViewer";
import TaskTable from "@/components/TaskTable";
import { Download, Presentation, Loader2, Sparkles, RefreshCw } from "lucide-react";

interface ProjectDetail {
  project: Project;
  tasks: Task[];
  progress: { progress_value: number; note: string };
  outputs: { risk_text: string; judge_feedback_text: string };
}

export default function LeaderProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [msg, setMsg] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function load() {
    const res = await apiRequest<ProjectDetail>(`/projects/${params.id}`);
    setData(res.data);
  }

  async function regenerateWorkflow() {
    await apiRequest("/workflow/generate", {
      method: "POST",
      body: JSON.stringify({ projectId: Number(params.id) })
    });
    setMsg("Workflow regenerated.");
    await load();
  }

  async function handleDownloadPptx() {
    if (!data?.project) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/projects/${data.project.id}/ppt/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMsg = "Failed to download presentation.";
        try {
          const errJson = await response.json();
          if (errJson.message) errorMsg = errJson.message;
        } catch {
          // not json
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `${data.project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-pitch-deck.pptx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setDownloadError(err.message || "Failed to download PPTX.");
    } finally {
      setIsDownloading(false);
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  if (!data) return <p className="p-6 text-slate-600">Loading project...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.project.title}</h2>
            <p className="mt-1 text-slate-600 max-w-2xl">{data.project.problem_statement}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Status: {data.project.status}
              </span>
              <span className="text-sm font-medium text-slate-500">
                Progress: {data.progress?.progress_value ?? 0}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPptx}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PPTX...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download .pptx
                </>
              )}
            </button>

            <Link
              href="/leader/ppt"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              <Presentation className="w-4 h-4 text-indigo-600" />
              Pitch Deck View
            </Link>

            <button
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-sky-700 text-white hover:bg-sky-800 transition"
              onClick={regenerateWorkflow}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Workflow
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {downloadError}
          </div>
        )}
        {msg && <p className="mt-2 text-sm text-emerald-700 font-medium">{msg}</p>}
      </div>

      <WorkflowViewer
        steps={Object.keys(data.project.workflow_status || {})}
        status={data.project.workflow_status || {}}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Risk Detection</h3>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
          {data.outputs.risk_text || "No risks recorded yet."}
        </pre>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Judge Simulation & Feedback</h3>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
          {data.outputs.judge_feedback_text || "No judge feedback recorded yet."}
        </pre>
      </div>

      <TaskTable tasks={data.tasks || []} />
    </div>
  );
}
