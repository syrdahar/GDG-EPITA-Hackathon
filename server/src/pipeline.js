import { MOCK_MODE } from "./config.js";
import { extractKnowledge } from "./agents/knowledgeExtractor.js";
import { designStory } from "./agents/storyDesigner.js";
import { designGame } from "./agents/gameDesigner.js";
import { mockKnowledge, mockStory, mockGame } from "./mock.js";
import {
  saveKnowledge,
  saveStory,
  saveGame,
  saveMeta,
  getKnowledge,
} from "./store.js";

export const STATUS = {
  QUEUED: "queued",
  EXTRACTING: "extracting", // Agent 1
  STORY: "designing_story", // Agent 2
  GAME: "designing_game", // Agent 3
  READY: "ready",
  ERROR: "error",
};

/**
 * Exécute le pipeline multi-agents en arrière-plan et met à jour le statut
 * dans le store à chaque étape (Redis = source de vérité partagée).
 */
export async function runPipeline({ id, pdfBase64, filename }) {
  try {
    // ── Agent 1 : Knowledge Extractor ─────────────────────────────
    await saveMeta(id, { status: STATUS.EXTRACTING });
    const knowledge = MOCK_MODE
      ? mockKnowledge()
      : await extractKnowledge({ pdfBase64 });
    await saveKnowledge(id, knowledge);
    await saveMeta(id, {
      subject: knowledge.detected_subject,
      level: knowledge.detected_level,
    });

    // ── Agent 2 : Story Designer ──────────────────────────────────
    await saveMeta(id, { status: STATUS.STORY });
    const story = MOCK_MODE
      ? mockStory(knowledge)
      : await designStory({ knowledge });
    await saveStory(id, story);

    // ── Agent 3 : Game Designer ───────────────────────────────────
    await saveMeta(id, { status: STATUS.GAME });
    const designed = MOCK_MODE
      ? mockGame(knowledge, story)
      : await designGame({ knowledge, story });

    // ── Assemblage du jeu final partageable ───────────────────────
    const game = {
      id,
      title: designed.title || story.title,
      universe: designed.universe || story.universe,
      story: designed.story || story.story_arc,
      tone: story.tone,
      hero: story.hero,
      characters: story.characters,
      difficulty: designed.difficulty,
      subject: knowledge.detected_subject,
      level: knowledge.detected_level,
      levels: designed.levels,
      createdAt: Date.now(),
    };
    await saveGame(id, game);
    await saveMeta(id, {
      status: STATUS.READY,
      title: game.title,
      levelCount: game.levels.length,
    });
    console.log(`[pipeline] Jeu ${id} prêt (${game.levels.length} niveaux).`);
  } catch (err) {
    console.error(`[pipeline] Erreur sur ${id}:`, err);
    await saveMeta(id, { status: STATUS.ERROR, error: err.message });
  }
}

export { getKnowledge };
