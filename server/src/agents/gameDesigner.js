import { generateJSON } from "../gemini.js";

/**
 * Agent 3 — Game Designer
 * Transforme le scénario en jeu vidéo pédagogique jouable (niveaux + QCM).
 * NE GÉNÈRE PAS d'images : uniquement des descriptions visuelles textuelles.
 */

const SYSTEM = `Tu es un game designer de serious games éducatifs.
Tu transformes une histoire + des connaissances en niveaux de jeu jouables.
Règles strictes :
- Chaque niveau = une scène (description visuelle), une narration, UNE question QCM.
- Chaque QCM a 4 choix (A, B, C, D), UNE SEULE bonne réponse, et une explication.
- Les questions doivent porter sur les notions RÉELLES du cours (jamais inventées).
- Les explications sont pédagogiques et renforcent la mémorisation.
- Adapte la difficulté au niveau scolaire détecté.
- Décris les visuels (lieu, ambiance, couleurs) SANS générer d'images.
- Durée cible du jeu : 10 à 20 minutes (vise 8 à 14 niveaux).
- Réponds toujours en français.`;

export async function designGame({ knowledge, story }) {
  const prompt = `Base de connaissances (JSON) :
${JSON.stringify(knowledge, null, 2)}

Scénario de l'aventure (JSON) :
${JSON.stringify(story, null, 2)}

Construis le jeu complet. Renvoie STRICTEMENT un objet JSON :
{
  "title": "${story.title || ""}",
  "universe": "reprends/affine l'univers",
  "story": "rappel narratif d'intro pour le joueur (2-3 phrases)",
  "difficulty": "facile | moyen | difficile (selon le niveau scolaire)",
  "levels": [
    {
      "chapter": "titre du chapitre correspondant",
      "scene_description": "description visuelle de la scène (lieu, ambiance, couleurs, éléments)",
      "narrative": "ce que vivent/disent les personnages à cette étape",
      "concept": "la notion du cours testée ici",
      "question": "énoncé de la question",
      "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct_answer": "A | B | C | D",
      "explanation": "explication pédagogique de la bonne réponse"
    }
  ]
}

Génère entre 8 et 14 niveaux, répartis sur les chapitres du scénario, couvrant les
notions importantes du cours. Varie les bonnes réponses (pas toujours la même lettre).`;

  const game = await generateJSON({
    systemInstruction: SYSTEM,
    prompt,
    temperature: 0.8,
  });

  return normalizeGame(game, story);
}

/** Nettoie/valide la sortie du game designer (utilisé aussi après édition). */
export function normalizeGame(game, story = {}) {
  const levels = (game.levels || [])
    .map((lvl, i) => {
      const choices = lvl.choices || {};
      const correct = String(lvl.correct_answer || "A").trim().toUpperCase().slice(0, 1);
      return {
        id: i + 1,
        chapter: lvl.chapter || "",
        scene_description: lvl.scene_description || "",
        narrative: lvl.narrative || "",
        concept: lvl.concept || "",
        question: lvl.question || "",
        choices: {
          A: choices.A || "",
          B: choices.B || "",
          C: choices.C || "",
          D: choices.D || "",
        },
        correct_answer: ["A", "B", "C", "D"].includes(correct) ? correct : "A",
        explanation: lvl.explanation || "",
      };
    })
    .filter((l) => l.question && l.choices.A);

  return {
    title: game.title || story.title || "EduQuest",
    universe: game.universe || story.universe || "",
    story: game.story || story.story_arc || "",
    difficulty: game.difficulty || "moyen",
    levels,
  };
}
