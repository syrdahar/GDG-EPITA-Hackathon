import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Charge le .env situé à la racine du monorepo (un cran au-dessus de /server).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: Number(process.env.PORT) || 3001,
  publicUrl: process.env.PUBLIC_URL || "http://localhost:5173",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
  redisUrl: process.env.REDIS_URL || "",
};

// Sans clé Gemini, on bascule en mode démo : le pipeline produit un jeu
// d'exemple cohérent sans appeler le LLM, pour que la démo tourne toujours.
export const MOCK_MODE = !config.gemini.apiKey;
