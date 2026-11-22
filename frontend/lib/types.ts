export type Role = "TEAM_LEADER" | "TEAM_MEMBER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  domain?: string;
}

export interface Project {
  id: number;
  title: string;
  problem_statement: string;
  description: string;
  objective: string;
  status?: string;
  data_sources: string[];
  workflow_status: Record<string, string>;
  created_by: number;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  assigned_to: number;
  title: string;
  description: string;
  instructions: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  project_title?: string;
  assigned_user_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  [key: string]: any;
}
