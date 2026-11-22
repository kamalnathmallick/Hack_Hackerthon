import { Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  showProject?: boolean;
}

export default function TaskTable({ tasks, showProject = true }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-2">Title</th>
            {showProject && <th className="px-4 py-2">Project</th>}
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="px-4 py-2">{task.title}</td>
              {showProject && <td className="px-4 py-2">{task.project_title || task.project_id}</td>}
              <td className="px-4 py-2">{task.status}</td>
              <td className="px-4 py-2">{task.priority}</td>
              <td className="px-4 py-2">{new Date(task.updated_at).toLocaleString()}</td>
            </tr>
          ))}
          {!tasks.length && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={showProject ? 5 : 4}>
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
