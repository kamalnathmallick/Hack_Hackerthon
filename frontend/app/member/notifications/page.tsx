"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Task } from "@/lib/types";

export default function MemberNotificationsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const res = await apiRequest<Task[]>("/tasks");
      setTasks(res.data);
    })();
  }, []);

  const notifications = useMemo(
    () =>
      tasks
        .map((task) => ({
          id: task.id,
          title: `Task ${task.status}: ${task.title}`,
          description: task.instructions || task.description || "Task updated.",
          time: task.updated_at
        }))
        .sort((a, b) => (a.time < b.time ? 1 : -1)),
    [tasks]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-xl border bg-white p-4">
            <p className="font-medium">{n.title}</p>
            <p className="mt-1 text-sm text-slate-600">{n.description}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(n.time).toLocaleString()}</p>
          </div>
        ))}
        {!notifications.length && <p className="text-slate-500">No notifications yet.</p>}
      </div>
    </div>
  );
}
