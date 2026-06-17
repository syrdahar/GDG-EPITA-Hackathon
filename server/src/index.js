import express from "express";
import cors from "cors";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config, MOCK_MODE } from "./config.js";
import {
  initStore,
  storeMode,
  saveMeta,
  getMeta,
  getGame,
  getKnowledge,
  saveGame,
  listGames,
} from "./store.js";
import { runPipeline, STATUS } from "./pipeline.js";
import { editGame } from "./agents/teacherEditor.js";
import { mockEdit } from "./mock.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 Mo
});

// ─── Santé / infos ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mode: MOCK_MODE ? "demo" : "live",
    model: MOCK_MODE ? null : config.gemini.model,
    store: storeMode(),
  });
});

// ─── Génération : upload PDF -> pipeline multi-agents (asynchrone) ─────────
app.post("/api/generate", upload.single("pdf"), async (req, res) => {
  try {
    if (MOCK_MODE && !req.file) {
      // En démo on tolère l'absence de PDF.
    } else if (!req.file) {
      return res.status(400).json({ error: "Aucun PDF fourni (champ 'pdf')." });
    }
    if (req.file && req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Le fichier doit être un PDF." });
    }

    const id = nanoid(10);
    const filename = req.file?.originalname || "cours.pdf";
    await saveMeta(id, {
      status: STATUS.QUEUED,
      filename,
      createdAt: Date.now(),
    });

    const pdfBase64 = req.file ? req.file.buffer.toString("base64") : null;
    // Lance le pipeline en arrière-plan (ne bloque pas la réponse HTTP).
    runPipeline({ id, pdfBase64, filename });

    res.json({
      id,
      shareUrl: `${config.publicUrl}/play/${id}`,
      mode: MOCK_MODE ? "demo" : "live",
    });
  } catch (err) {
    console.error("[/api/generate]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Statut de génération (polling) ───────────────────────────────────────
app.get("/api/games/:id/status", async (req, res) => {
  const meta = await getMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Jeu introuvable." });
  res.json(meta);
});

// ─── Récupération du jeu complet (joueur élève) ───────────────────────────
app.get("/api/games/:id", async (req, res) => {
  const game = await getGame(req.params.id);
  if (!game) {
    const meta = await getMeta(req.params.id);
    if (meta) return res.status(202).json({ status: meta.status, meta });
    return res.status(404).json({ error: "Jeu introuvable." });
  }
  res.json(game);
});

// ─── Galerie des jeux générés ─────────────────────────────────────────────
app.get("/api/games", async (req, res) => {
  res.json(await listGames());
});

// ─── Agent 4 : édition du jeu via chatbot ─────────────────────────────────
app.post("/api/games/:id/edit", async (req, res) => {
  try {
    const { command } = req.body || {};
    if (!command || !command.trim()) {
      return res.status(400).json({ error: "Commande vide." });
    }
    const game = await getGame(req.params.id);
    if (!game) return res.status(404).json({ error: "Jeu introuvable." });

    const knowledge = await getKnowledge(req.params.id);
    const result = MOCK_MODE
      ? mockEdit(game, command)
      : await editGame({ game, command, knowledge });

    // Préserve les métadonnées du jeu (id, createdAt, etc.).
    const updated = { ...game, ...result.game, id: game.id, createdAt: game.createdAt };
    await saveGame(req.params.id, updated);
    await saveMeta(req.params.id, {
      title: updated.title,
      levelCount: updated.levels.length,
    });

    res.json({ message: result.message, game: updated });
  } catch (err) {
    console.error("[/api/games/:id/edit]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Sert le frontend buildé en production (client/dist) ──────────────────
const clientDist = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function start() {
  await initStore();
  app.listen(config.port, () => {
    console.log(`\n🎮 EduQuest AI — serveur sur http://localhost:${config.port}`);
    console.log(`   Mode LLM : ${MOCK_MODE ? "DÉMO (pas de clé Gemini)" : `LIVE (${config.gemini.model})`}`);
    console.log(`   Store    : ${storeMode()}\n`);
  });
}

start();
