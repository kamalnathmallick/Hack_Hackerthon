const { createPPT } = require("../models/pptModel");
const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * PPT Agent:
 * Generates an end-to-end, multi-slide pitch deck covering:
 * Slide 1: Title & Hook / Vision
 * Slide 2: Core Problem & Target User Friction
 * Slide 3: Solution & Value Proposition
 * Slide 4: System Architecture & Data Flow
 * Slide 5: Tech Stack Selection & Justification
 * Slide 6: Implementation Plan & Milestones
 * Slide 7: Impact, Market Potential & Presenter Wrap-Up
 * 
 * Each slide contains title, bullets[], and speakerNotes.
 */
async function pptAgent(project, summaryText, analysis = null, feasibility = null, risks = null, roadmap = null) {
  const context = `Project: "${project.title}"
Problem Statement: "${project.problem_statement || ""}"
${analysis ? `Breakdown: ${analysis.breakdown}\nObjectives: ${analysis.objectives}` : ""}
${feasibility ? `Tech Stack: ${(feasibility.recommendedStack || []).join(", ")}` : ""}
Summary: ${summaryText || ""}`;

  const prompt = `You are a World-Class Pitch Coach and Venture Architect for top hackathons (Y Combinator, HackMIT, ETHGlobal).
Create a complete, high-impact 7-slide pitch deck for:
${context}

Return a structured JSON object with 7 slides strictly covering:
1. Slide 1: Title & Hook / Vision
2. Slide 2: The Core Problem & Friction Point
3. Slide 3: The Solution & Value Proposition
4. Slide 4: System Architecture & Data Flow
5. Slide 5: Tech Stack Selection & Justification
6. Slide 6: Implementation Plan & Milestones
7. Slide 7: Impact, Market Potential & Call to Action

Each slide must contain:
- slideNumber: Integer (1 to 7)
- title: Punchy, memorable slide title
- subtitle: Supporting tagline
- keyTakeaway: One-sentence main takeaway for judges
- bullets: Array of 3-4 concise, impactful bullet points
- speakerNotes: Complete spoken script for the team presenter to say to the judges
- suggestedVisual: Description of the chart, mock, or architecture diagram to display`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            slideNumber: { type: Type.INTEGER },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING },
            bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            speakerNotes: { type: Type.STRING },
            suggestedVisual: { type: Type.STRING }
          },
          required: ["slideNumber", "title", "bullets", "speakerNotes"]
        },
        description: "Complete list of 7 pitch deck slides."
      }
    },
    required: ["slides"]
  };

  const fallbackFn = () => ({
    slides: [
      {
        slideNumber: 1,
        title: `${project.title}`,
        subtitle: "Next-Generation Automated Hackathon Platform",
        keyTakeaway: `Empowering engineering teams with real-time AI orchestration for ${project.title}.`,
        bullets: [
          `Project: ${project.title}`,
          "Mission: Transform complex project ideas into production architectures in seconds",
          "Powered by: Google Gemini 2.5 Flash, Node.js, Next.js, and PostgreSQL"
        ],
        speakerNotes: `Good morning judges! We are proud to present ${project.title}. Today, technical teams spend hours deliberating over architecture, workflows, and task allocation. We solved that with an autonomous multi-agent pipeline.`,
        suggestedVisual: "Hero banner with dynamic glowing logo and product motto."
      },
      {
        slideNumber: 2,
        title: "The Problem & User Friction",
        subtitle: "Why Traditional Hackathon Execution Derails",
        keyTakeaway: "Unorganized workflows and manual task assignment cause 70% of hackathon teams to lose momentum.",
        bullets: [
          `Core Pain: ${project.problem_statement || "Unclear technical scopes and scattered task assignments."}`,
          "Communication fragmentation between team leads and contributors",
          "Zero real-time visibility into project dependencies and blocking bottlenecks"
        ],
        speakerNotes: `Here is the reality: every hackathon team faces the same bottleneck. As you see on the slide, the pain point is clear: ${project.problem_statement}. Without real-time orchestration, execution breaks down.`,
        suggestedVisual: "Split diagram comparing chaotic team communication vs organized workflow."
      },
      {
        slideNumber: 3,
        title: "The Solution & Value Proposition",
        subtitle: "Autonomous Multi-Agent Orchestration",
        keyTakeaway: "HackFlow AI transforms a single prompt into an actionable, end-to-end development system.",
        bullets: [
          "Instant decomposition of problem statements into structured MVP architectures",
          "Balanced, skill-based task delegation directly to team contributors",
          "Real-time event broadcasting over WebSocket channels"
        ],
        speakerNotes: "Our solution introduces HackFlow AI: an autonomous orchestration platform that ingests raw project statements and creates structured engineering roadmaps in seconds.",
        suggestedVisual: "Product screenshot highlighting the leader overview and live progress indicators."
      },
      {
        slideNumber: 4,
        title: "System Architecture & Data Flow",
        subtitle: "Built for High-Throughput Relational Integrity",
        keyTakeaway: "A modular, event-driven architecture combining Express, PostgreSQL, Socket.IO, and Gemini.",
        bullets: [
          "Client Layer: Next.js 14 App Router with TailwindCSS and Framer Motion",
          "API & Real-time: Express REST backend paired with Socket.IO project rooms",
          "Intelligence & Storage: Google Gemini API for structured planning, PostgreSQL for ACID persistence"
        ],
        speakerNotes: "Let us walk through our architecture. From the Next.js frontend, project requests flow to our Express backend. As our Gemini agents analyze feasibility, Socket.IO pushes live step updates.",
        suggestedVisual: "End-to-end architecture flowchart showing Frontend -> Backend -> Gemini -> PostgreSQL."
      },
      {
        slideNumber: 5,
        title: "Tech Stack Selection & Justification",
        subtitle: "Modern, Scalable, Production-Ready Technologies",
        keyTakeaway: "Zero legacy overhead: modern TypeScript, Google GenAI SDK, and resilient PostgreSQL.",
        bullets: [
          "Frontend: Next.js 14, React 18, TailwindCSS, Lucide Icons",
          "Backend: Node.js, Express, Socket.IO, @google/genai SDK",
          "Data & Security: PostgreSQL (pg), JWT, bcryptjs, Zod validation"
        ],
        speakerNotes: "We selected our tech stack intentionally. By pairing Next.js with PostgreSQL and the official Google GenAI SDK, we ensure high developer velocity and robust type safety.",
        suggestedVisual: "Tech stack badge grid with performance metrics and response latency graphs."
      },
      {
        slideNumber: 6,
        title: "Implementation Plan & Milestones",
        subtitle: "From Rapid Prototype to Production Resilience",
        keyTakeaway: "A phased 4-sprint roadmap ensuring risk mitigation and continuous integration.",
        bullets: [
          "Phase 1: Security hardening, role normalization, and schema relational integrity",
          "Phase 2: Gemini multi-agent structured pipeline integration and task balancing",
          "Phase 3: Asynchronous background pipeline streaming and downloadable PPTX presentation generator"
        ],
        speakerNotes: "Our implementation roadmap demonstrates clear technical execution. We have prioritized security, real-time feedback, and automated pitch-readiness.",
        suggestedVisual: "Horizontal timeline roadmap with milestones and completion checks."
      },
      {
        slideNumber: 7,
        title: "Impact, Market Potential & Future Scope",
        subtitle: "Accelerating the Future of Collaborative Engineering",
        keyTakeaway: "HackFlow AI reduces hackathon project setup time from 4 hours to under 30 seconds.",
        bullets: [
          "Immediate Developer Impact: Instant team alignment, zero friction task delegation",
          "Future Extensions: GitHub issue synchronization, automated code scaffolding, IDE plugins",
          "Call to Action: Try HackFlow AI today and turn your hackathon ideas into reality"
        ],
        speakerNotes: "In conclusion, HackFlow AI is not just a hackathon tool—it is the blueprint for the next generation of autonomous engineering coordination. Thank you, and we welcome your questions!",
        suggestedVisual: "Impact metric callouts (+80% velocity, 30s setup) and team contact cards."
      }
    ]
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a world-class venture capitalist and hackathon judge. Generate an authentic, compelling 7-slide pitch deck.",
    fallbackFn
  });

  const slides = Array.isArray(result.slides) && result.slides.length > 0 ? result.slides : fallbackFn().slides;

  // Persist structured pitch deck JSON in database
  const pptPayload = {
    project_id: project.id,
    ppt_text: JSON.stringify({
      title: project.title,
      generatedAt: new Date().toISOString(),
      slides
    })
  };

  await createPPT(pptPayload);

  return {
    slides,
    pptText: pptPayload.ppt_text
  };
}

module.exports = { pptAgent };
