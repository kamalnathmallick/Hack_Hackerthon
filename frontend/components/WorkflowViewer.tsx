interface Props {
  steps: string[];
  status: Record<string, string>;
}

export default function WorkflowViewer({ steps, status }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 text-lg font-semibold">Workflow Steps</h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center justify-between rounded border px-3 py-2">
            <span className="text-sm">
              {i + 1}. {step}
            </span>
            <span
              className={`rounded px-2 py-1 text-xs ${
                status?.[step] === "Completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {status?.[step] || "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
