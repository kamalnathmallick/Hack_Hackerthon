"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Task } from "@/lib/types";
import { getSocket } from "@/lib/socket";

const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Completed", "Blocked"];

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    const res = await apiRequest<Task[]>("/tasks");
    setTasks(res.data);
  }

  async function updateStatus(task: Task, status: string) {
    await apiRequest(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    await load();
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("task:assigned", load);
    socket.on("task:updated", load);
    return () => {
      socket.off("task:assigned", load);
      socket.off("task:updated", load);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Tasks</h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-slate-500">Project: {task.project_title}</p>
              </div>
              <Link href={`/member/project/${task.project_id}`} className="rounded border px-2 py-1 text-xs">
                Open Project
              </Link>
            </div>
            <p className="mt-2 text-sm">{task.description || "No description."}</p>
            <p className="mt-1 text-sm text-slate-600">
              Instructions: {task.instructions || "No instructions."}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span>Status:</span>
              <select
                className="rounded border px-2 py-1"
                value={task.status}
                onChange={(e) => updateStatus(task, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="rounded bg-slate-100 px-2 py-1">Priority: {task.priority}</span>
            </div>
          </div>
        ))}
        {!tasks.length && <p className="text-slate-500">No tasks assigned yet.</p>}
      </div>
    </div>
  );
}
