"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Project, Task } from "@/lib/types";
import WorkflowViewer from "@/components/WorkflowViewer";

interface Data {
  project: Project;
  tasks: Task[];
  progress: { progress_value: number; note: string };
}

export default function MemberProjectPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiRequest<Data>(`/projects/${params.id}`);
      setData(res.data);
    })();
  }, [params.id]);

  if (!data) return <p>Loading project...</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-2xl font-semibold">{data.project.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{data.project.problem_statement}</p>
        <p className="mt-2 text-sm">Project progress: {data.progress.progress_value}%</p>
      </div>

      <WorkflowViewer
        steps={Object.keys(data.project.workflow_status)}
        status={data.project.workflow_status}
      />

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-lg font-semibold">My Assigned Tasks in This Project</h3>
        <div className="mt-2 space-y-2">
          {data.tasks.map((task) => (
            <div key={task.id} className="rounded border p-3 text-sm">
              <p className="font-medium">{task.title}</p>
              <p>Status: {task.status}</p>
              <p>Instructions: {task.instructions || "No instructions."}</p>
            </div>
          ))}
          {!data.tasks.length && <p className="text-slate-500">No tasks for this project.</p>}
        </div>
      </div>
    </div>
  );
}
