import { GoogleGenAI } from "@google/genai";
import { config, MOCK_MODE } from "./config.js";

let ai = null;
if (!MOCK_MODE) {
  ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
}

/** Extrait un objet JSON d'une réponse texte (tolère d'éventuels ```json fences). */
function parseJSON(text) {
  if (!text) throw new Error("Réponse LLM vide");
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) cleaned = fence[1].trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Dernier recours : isole du premier { au dernier }.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Impossible de parser le JSON renvoyé par le LLM");
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Liste de modèles essayés dans l'ordre : si le principal reste saturé,
// on bascule sur un modèle de secours plus disponible.
const MODELS = [...new Set([config.gemini.model, "gemini-2.0-flash"])];

// Codes d'erreur transitoires de l'API Gemini qui méritent un nouvel essai.
const RETRYABLE = new Set([429, 500, 503]);

/**
 * Appelle generateContent avec backoff exponentiel + fallback de modèle.
 * Gère les 503 "high demand", 429 "rate limit" et 500 transitoires.
 */
async function generateWithRetry(params, { retriesPerModel = 4 } = {}) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
      try {
        return await ai.models.generateContent({ model, ...params });
      } catch (err) {
        lastErr = err;
        const status = err?.status ?? err?.code;
        if (!RETRYABLE.has(Number(status))) throw err; // erreur non transitoire
        if (attempt < retriesPerModel) {
          const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.floor(Math.random() * 500);
          console.warn(
            `[gemini] ${model} indisponible (${status}). Nouvel essai ${attempt + 1}/${retriesPerModel} dans ${delay}ms…`
          );
          await sleep(delay);
        }
      }
    }
    console.warn(`[gemini] ${model} épuisé après ${retriesPerModel} essais -> bascule modèle suivant.`);
  }
  throw lastErr;
}

/**
 * Appelle Gemini et renvoie un objet JSON.
 * @param {object} opts
 * @param {string} opts.prompt          Instruction utilisateur.
 * @param {string} [opts.systemInstruction] Rôle / contraintes de l'agent.
 * @param {string} [opts.pdfBase64]     PDF encodé base64 (lecture multimodale native).
 * @param {object} [opts.responseSchema] Schéma JSON attendu (optionnel).
 * @param {number} [opts.temperature]
 */
export async function generateJSON({
  prompt,
  systemInstruction,
  pdfBase64,
  responseSchema,
  temperature = 0.7,
}) {
  if (MOCK_MODE) {
    throw new Error("generateJSON appelé en MOCK_MODE (ne devrait pas arriver)");
  }

  const parts = [];
  if (pdfBase64) {
    parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
  }
  parts.push({ text: prompt });

  const response = await generateWithRetry({
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      temperature,
      responseMimeType: "application/json",
      ...(responseSchema ? { responseSchema } : {}),
    },
  });

  return parseJSON(response.text);
}
