"use client";

import { getToken } from "./auth";
import { ApiResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Request failed.");
  }

  // Normalize API responses so that legacy named properties (projects, tasks, etc)
  // are accessible universally via the .data property, preventing map() undefined errors.
  if (json.success && json.data === undefined) {
    json.data = json.projects || json.tasks || json.workflow || json.progress || json.summary || json.ppt || json.ppt_outputs || json.user || [];
  }

  return json as ApiResponse<T>;
}

export { API_URL };
