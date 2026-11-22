const { GoogleGenAI, Type } = require("@google/genai");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Execute a structured prompt with Google Gemini using JSON Schema validation.
 * Falls back gracefully to intelligent contextual generator if API key is missing or offline.
 */
async function callGeminiStructured({ prompt, schema, systemInstruction, fallbackFn, temperature = 0.3 }) {
  const client = getGeminiClient();

  if (client) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      console.log(`[Gemini AI] Calling Google Gemini (${model}) with structured schema...`);
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are an expert technical hackathon architect and project orchestrator for HackFlow AI. Generate crisp, professional, production-ready plans.",
          temperature,
          responseMimeType: "application/json",
          responseJsonSchema: schema
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        console.log("[Gemini AI] Successfully received and parsed structured JSON response.");
        return parsed;
      }
    } catch (error) {
      console.error("[Gemini AI] Call failed or quota exceeded:", error.message);
      console.log("[Gemini AI] Falling back to contextual fallback generator.");
    }
  } else {
    console.log("[Gemini AI] GEMINI_API_KEY not configured. Set GEMINI_API_KEY in backend/.env for live LLM responses.");
  }

  if (typeof fallbackFn === "function") {
    return fallbackFn();
  }
  throw new Error("Gemini API call failed and no fallback provided.");
}

module.exports = {
  getGeminiClient,
  callGeminiStructured,
  Type
};
