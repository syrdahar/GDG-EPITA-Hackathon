import { generateJSON } from "../gemini.js";
import { normalizeGame } from "./gameDesigner.js";

/**
 * Agent 4 — Teacher Editor
 * Modifie le jeu existant via une commande en langage naturel (chatbot).
 * Modifie UNIQUEMENT les éléments concernés, sans tout régénérer, en
 * préservant la cohérence globale.
 */

const SYSTEM = `Tu es l'assistant d'édition d'un serious game éducatif.
Le professeur te donne une instruction en langage naturel ; tu modifies le jeu.
Règles strictes :
- Ne modifie QUE les éléments concernés par la demande.
- Ne régénère pas tout le jeu inutilement : conserve ce qui n'est pas visé.
- Préserve la cohérence narrative et pédagogique.
- Ne crée jamais de notion absente de la base de connaissances fournie.
- Conserve le format exact des niveaux (scene_description, narrative, concept,
  question, choices A/B/C/D, correct_answer, explanation).
- Réponds toujours en français.`;

export async function editGame({ game, command, knowledge }) {
  const prompt = `Base de connaissances du cours (à respecter, ne rien inventer) :
${JSON.stringify(knowledge || {}, null, 2)}

Jeu actuel (JSON) :
${JSON.stringify(game, null, 2)}

Instruction du professeur :
"""${command}"""

Applique la modification demandée. Renvoie STRICTEMENT un objet JSON :
{
  "message": "phrase courte décrivant ce que tu as modifié",
  "game": { ...le jeu complet mis à jour, MÊME format que le jeu actuel... }
}`;

  const result = await generateJSON({
    systemInstruction: SYSTEM,
    prompt,
    temperature: 0.6,
  });

  const updated = normalizeGame(result.game || game, game);
  return {
    message: result.message || "Modification appliquée.",
    game: updated,
  };
}
