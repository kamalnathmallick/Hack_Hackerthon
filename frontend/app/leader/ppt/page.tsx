"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Project } from "@/lib/types";
import { getToken } from "@/lib/auth";
import { 
  Download, 
  Presentation, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface SlideData {
  slideNumber: number;
  title: string;
  subtitle?: string;
  keyTakeaway?: string;
  bullets?: string[];
  speakerNotes?: string;
  suggestedVisual?: string;
}

export default function LeaderPptPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [pptText, setPptText] = useState("");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function loadPpt(id: number) {
    setLoading(true);
    setMessage("");
    setDownloadError(null);
    try {
      // First try /api/ppt/:projectId
      const res = await apiRequest<any>(`/ppt/${id}`);
      const pptRecord = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : res.data;
      
      let rawText = "";
      let parsedSlides: SlideData[] = [];

      if (pptRecord) {
        if (pptRecord.slides_json) {
          const sJson = typeof pptRecord.slides_json === "string" 
            ? JSON.parse(pptRecord.slides_json) 
            : pptRecord.slides_json;
          parsedSlides = Array.isArray(sJson) ? sJson : (sJson.slides || []);
        }

        if (pptRecord.ppt_text) {
          rawText = pptRecord.ppt_text;
          if (parsedSlides.length === 0) {
            try {
              const p = JSON.parse(rawText);
              parsedSlides = Array.isArray(p) ? p : (p.slides || []);
            } catch {
              // Plain text
            }
          }
        }
      }

      setPptText(rawText);
      setSlides(parsedSlides);
    } catch {
      setPptText("");
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<Project[]>("/projects");
        const list = Array.isArray(res.data) ? res.data : [];
        setProjects(list);
        if (list.length > 0) {
          setProjectId(list[0].id);
          loadPpt(list[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load projects:", err);
      }
    })();
  }, []);

  async function handleDownloadPptx() {
    if (!projectId) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/projects/${projectId}/ppt/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const currentProj = projects.find((p) => p.id === projectId);
      const safeTitle = (currentProj?.title || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      a.download = `${safeTitle}-pitch-deck.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Pitch deck (.pptx) downloaded successfully!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      setDownloadError(err.message || "Failed to download PPTX file.");
    } finally {
      setIsDownloading(false);
    }
  }

  function downloadText() {
    const blob = new Blob([pptText || "No PPT output."], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hackflow-pitch-outline-project-${projectId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeProject = projects.find((p) => p.id === projectId);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Presentation className="text-indigo-600" size={30} />
            Presentation & Pitch Deck
          </h1>
          <p className="text-slate-500 mt-1">
            Download polished widescreen PowerPoint (.pptx) slides with presenter notes and visual blueprints.
          </p>
        </div>

        {projectId && (
          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-70 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span>{isDownloading ? "Generating .pptx..." : "Download .pptx"}</span>
          </button>
        )}
      </div>

      {/* Control Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Active Project
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-700 transition"
              value={projectId || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                setProjectId(id);
                loadPpt(id);
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <button
              onClick={handleDownloadPptx}
              disabled={isDownloading || !projectId}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download .pptx
            </button>
            <button
              onClick={downloadText}
              disabled={!pptText}
              className="flex items-center gap-2 border border-slate-200 bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-100 transition disabled:opacity-50"
            >
              <FileText size={16} />
              Outline Text
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {downloadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}
      </div>

      {/* Slide Deck Presentation Viewer */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
          <p className="text-slate-500 font-medium">Loading slide deck...</p>
        </div>
      ) : slides.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <span>Slide Deck Outline ({slides.length} Widescreen Slides)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Widescreen 16:9 • PPTX Ready
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {slides.map((slide, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Slide Card Header */}
                <div className="bg-slate-900 text-white p-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
                      Slide {slide.slideNumber || idx + 1}
                    </span>
                    <h3 className="text-xl font-bold mt-1 text-white">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-sm text-slate-400 mt-0.5">{slide.subtitle}</p>
                    )}
                  </div>
                  {slide.suggestedVisual && (
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl shrink-0 hidden sm:block">
                      📊 {slide.suggestedVisual}
                    </span>
                  )}
                </div>

                {/* Bullets & Takeaways */}
                <div className="p-6 space-y-4">
                  {slide.bullets && slide.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {slide.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                          <ChevronRight size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {slide.keyTakeaway && (
                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                        Key Takeaway for Judges
                      </span>
                      <p className="text-sm text-slate-800 italic font-medium">"{slide.keyTakeaway}"</p>
                    </div>
                  )}

                  {slide.speakerNotes && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Presenter Spoken Script (Speaker Notes)
                      </span>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl font-mono leading-relaxed">
                        {slide.speakerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
          <Presentation size={36} className="text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Slide Deck Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {activeProject 
              ? `No presentation has been generated for "${activeProject.title}" yet.`
              : "Select a project above to inspect or export its pitch presentation."
            }
          </p>
        </div>
      )}
    </div>
  );
}
