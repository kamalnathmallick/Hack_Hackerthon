"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Project } from "@/lib/types";

export default function AssignTasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [domain, setDomain] = useState("Frontend");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const projectRes = await apiRequest<Project[]>("/projects");
      setProjects(projectRes.data);
      if (projectRes.data[0]) setProjectId(String(projectRes.data[0].id));
    })();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(projectId),
          memberEmail,
          domain,
          title: title || `${domain} Task`,
          description,
          instructions,
          priority,
          status: "Assigned"
        })
      });
      setMessage("Task assigned successfully.");
      setTitle("");
      setDescription("");
      setInstructions("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign task.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Assign Tasks</h2>
      <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border bg-white p-4">
        <label className="block text-sm">
          Project
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Member Email ID
          <input
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="user@member.com"
          />
        </label>

        <label className="block text-sm">
          Domain of Work
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
            {["Frontend", "Backend", "AI", "Database", "Testing"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Task Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="block text-sm">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-20 w-full rounded border px-3 py-2" />
        </label>

        <label className="block text-sm">
          Instructions
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="mt-1 min-h-20 w-full rounded border px-3 py-2" />
        </label>

        <label className="block text-sm">
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}

        <button className="rounded bg-sky-700 px-4 py-2 text-white">Assign Task</button>
      </form>
    </div>
  );
}
