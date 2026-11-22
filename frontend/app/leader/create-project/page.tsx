"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Presentation, 
  LayoutDashboard, 
  AlertCircle,
  Cpu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getSocket } from "@/lib/socket";

interface AgentStepState {
  id: number;
  name: string;
  agent: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  message?: string;
}

const DEFAULT_STEPS: AgentStepState[] = [
  {
    id: 1,
    name: "Problem & Scope Analysis",
    agent: "ProblemAnalysisAgent",
    description: "Deconstructing problem statement, user friction, and MVP boundary",
    status: "pending"
  },
  {
    id: 2,
    name: "Architecture & Feasibility",
    agent: "FeasibilityAgent",
    description: "Evaluating architectural feasibility and tech stack recommendations",
    status: "pending"
  },
  {
    id: 3,
    name: "Phased Roadmap Generation",
    agent: "RoadmapAgent",
    description: "Formulating 4-sprint milestone roadmap and timelines",
    status: "pending"
  },
  {
    id: 4,
    name: "Workflow Persistence",
    agent: "WorkflowAgent",
    description: "Structuring and persisting sequential execution pipeline steps",
    status: "pending"
  },
  {
    id: 5,
    name: "Smart Task Breakdown",
    agent: "TaskAgent",
    description: "Decomposing tasks with effort estimates and skill-matched member assignment",
    status: "pending"
  },
  {
    id: 6,
    name: "Risk & Vulnerability Assessment",
    agent: "RiskAgent",
    description: "Identifying technical risks with actionable mitigation strategies",
    status: "pending"
  },
  {
    id: 7,
    name: "Executive Summary & Pitch Deck",
    agent: "SummaryAndPPTAgents",
    description: "Compiling 7-slide competition pitch deck and executive dossier",
    status: "pending"
  }
];

export default function CreateProject() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ id: number; title: string } | null>(null);
  const [steps, setSteps] = useState<AgentStepState[]>(DEFAULT_STEPS);
  const [currentMessage, setCurrentMessage] = useState<string>("Initializing multi-agent pipeline...");
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set up Socket.IO listeners once project is created
  useEffect(() => {
    if (!createdProject) return;

    const socket = getSocket();
    const projectId = createdProject.id;

    socket.emit("join:project", projectId);

    const handleStatus = (payload: any) => {
      if (Number(payload.projectId) !== projectId) return;
      if (payload.message) setCurrentMessage(payload.message);

      const stepNum = Number(payload.step);
      if (stepNum > 0) {
        setSteps((prev) =>
          prev.map((s) => {
            if (s.id < stepNum) return { ...s, status: "completed" };
            if (s.id === stepNum) return { ...s, status: "running", message: payload.message };
            return s;
          })
        );
      }
    };

    const handleStepComplete = (payload: any) => {
      if (Number(payload.projectId) !== projectId) return;
      const stepNum = Number(payload.step);
      setSteps((prev) =>
        prev.map((s) => (s.id === stepNum ? { ...s, status: "completed", message: payload.message } : s))
      );
    };

    const handleDone = (payload: any) => {
      if (Number(payload.projectId) !== projectId) return;
      setIsDone(true);
      setCurrentMessage("All 7 agents completed execution. Project is ready!");
      setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));
    };

    const handleError = (payload: any) => {
      if (Number(payload.projectId) !== projectId) return;
      setErrorMsg(payload.error || "Agent execution encountered an error.");
    };

    socket.on("agent:status", handleStatus);
    socket.on("agent:step_complete", handleStepComplete);
    socket.on("agent:done", handleDone);
    socket.on("agent:error", handleError);

    return () => {
      socket.off("agent:status", handleStatus);
      socket.off("agent:step_complete", handleStepComplete);
      socket.off("agent:done", handleDone);
      socket.off("agent:error", handleError);
    };
  }, [createdProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: formData.title,
          problemStatement: formData.problemStatement,
          status: "GENERATING"
        })
      });

      const data = await res.json();
      if (data.success && data.project) {
        setCreatedProject({ id: data.project.id, title: data.project.title });
      } else {
        setErrorMsg(data.message || "Failed to create project.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={30} />
          {createdProject ? "Autonomous AI Pipeline Live" : "Create AI Project"}
        </h1>
        <p className="text-slate-500 mt-2">
          {createdProject 
            ? `Orchestrating multi-agent system for "${createdProject.title}" in real-time.`
            : "Describe the project problem statement. Our autonomous Gemini multi-agent pipeline will formulate the architecture, roadmap, tasks, workflows, and pitch deck."
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!createdProject ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <Card hover={false}>
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/70 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm placeholder:text-slate-400"
                    placeholder="e.g. EcoTrack: Smart Carbon Accounting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Problem Statement</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full bg-white/70 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm placeholder:text-slate-400 resize-none"
                    placeholder="Describe the core friction, target market, or engineering challenge..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isSubmitting}
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-lg shadow-indigo-500/25 font-semibold mt-2 disabled:opacity-70 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isSubmitting ? "Starting Agent Orchestration..." : "Launch Autonomous AI Agents"}
                </motion.button>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="progress-monitor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Real-time Status Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1 uppercase tracking-wider">
                    <Cpu size={18} className="animate-pulse" />
                    Agent Orchestrator Active
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{createdProject.title}</h2>
                  <p className="text-slate-500 text-sm mt-1">{currentMessage}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-indigo-600">{progressPercent}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                />
              </div>

              {/* Action Buttons if Done */}
              {isDone && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 text-emerald-800 font-medium">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <span>Project generated successfully! Presentation slides, tasks, and workflows ready.</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => router.push(`/leader/project/${createdProject.id}`)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-indigo-700 transition"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push(`/leader/ppt`)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-slate-900 transition"
                    >
                      <Presentation size={18} />
                      Slides
                    </button>
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Checklist of Steps */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span>Autonomous Agent Execution Pipeline</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {completedCount} of {steps.length} Steps Completed
                </span>
              </h3>

              <div className="space-y-4">
                {steps.map((step) => {
                  const isCompleted = step.status === "completed";
                  const isRunning = step.status === "running";

                  return (
                    <div 
                      key={step.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                        isRunning 
                          ? "border-indigo-300 bg-indigo-50/60 shadow-sm" 
                          : isCompleted 
                          ? "border-slate-100 bg-slate-50/60" 
                          : "border-slate-100 opacity-60"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 size={22} className="text-emerald-500" />
                        ) : isRunning ? (
                          <Loader2 size={22} className="text-indigo-600 animate-spin" />
                        ) : (
                          <Clock size={22} className="text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-bold ${isRunning ? "text-indigo-900" : "text-slate-800"}`}>
                            {step.name}
                          </h4>
                          <span className="text-xs font-mono text-slate-400">{step.agent}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {isRunning && step.message ? step.message : step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View in background button */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => router.push("/leader/projects")}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                >
                  <span>View All Projects in Background</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
