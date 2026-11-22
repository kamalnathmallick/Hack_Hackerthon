"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Task } from "@/lib/types";
import TaskTable from "@/components/TaskTable";

export default function MemberProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const res = await apiRequest<Task[]>("/tasks");
      setTasks(res.data);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const blocked = tasks.filter((t) => t.status === "Blocked").length;
    return {
      total,
      completed,
      inProgress,
      blocked,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Progress</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded border bg-white p-3 text-sm">Total: {stats.total}</div>
        <div className="rounded border bg-white p-3 text-sm">Completed: {stats.completed}</div>
        <div className="rounded border bg-white p-3 text-sm">In Progress: {stats.inProgress}</div>
        <div className="rounded border bg-white p-3 text-sm">Blocked: {stats.blocked}</div>
        <div className="rounded border bg-white p-3 text-sm">Completion: {stats.percent}%</div>
      </div>
      <TaskTable tasks={tasks} />
    </div>
  );
}
