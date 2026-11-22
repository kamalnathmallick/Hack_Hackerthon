const { buildPptxBuffer, sanitizeFilename, extractSlides } = require("../src/services/pptExportService");

describe("PPTX Presentation Export Service", () => {
  const mockProject = {
    id: 1,
    title: "EcoTrack AI",
    problem_statement: "Tracking household carbon footprints with real-time IoT sensors."
  };

  const mockSlides = [
    {
      slideNumber: 1,
      title: "EcoTrack AI: Intelligent Carbon Footprint Monitor",
      subtitle: "Pitch Deck & Technical Proposal",
      keyTakeaway: "Empowering everyday consumers with automated emissions telemetry.",
      bullets: [
        "IoT telemetry streaming directly to personal dashboard",
        "Predictive savings models powered by Gemini AI",
        "Targeting 15% reduction in domestic electrical emissions"
      ],
      speakerNotes: "Good morning judges, we are excited to showcase EcoTrack AI."
    },
    {
      slideNumber: 2,
      title: "Core Problem Breakdown",
      subtitle: "Why emissions tracking remains broken",
      keyTakeaway: "Utility bills arrive 30 days too late to change behavioral patterns.",
      bullets: [
        "Consumers lack real-time feedback on appliance consumption",
        "Existing smart meter integrations are fragmented and proprietary",
        "Manual tracking apps suffer from 90% abandonment after day 7"
      ],
      speakerNotes: "Here we highlight the critical data latency problem in modern homes."
    }
  ];

  test("sanitizeFilename handles spaces, symbols, and empty input", () => {
    expect(sanitizeFilename("EcoTrack AI - Modern Platform!")).toBe("ecotrack-ai-modern-platform");
    expect(sanitizeFilename("   ###   ")).toBe("project");
    expect(sanitizeFilename("")).toBe("project");
  });

  test("extractSlides correctly parses JSONB and legacy formats", () => {
    const jsonbRecord = { slides_json: { slides: mockSlides } };
    expect(extractSlides(jsonbRecord, mockProject)).toHaveLength(2);

    const stringRecord = { ppt_text: JSON.stringify({ slides: mockSlides }) };
    expect(extractSlides(stringRecord, mockProject)).toHaveLength(2);

    const plainTextRecord = { ppt_text: "Plain text summary of the pitch" };
    const fallback = extractSlides(plainTextRecord, mockProject);
    expect(fallback.length).toBeGreaterThanOrEqual(1);
    expect(fallback[0].title).toBe("EcoTrack AI");
  });

  test("buildPptxBuffer generates a valid, non-empty PPTX buffer with PK magic bytes", async () => {
    const buffer = await buildPptxBuffer(mockProject, mockSlides);

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);

    // PPTX is a ZIP / OpenXML archive, so first 2 bytes must be 'P' (0x50) and 'K' (0x4B)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  }, 15000);
});
