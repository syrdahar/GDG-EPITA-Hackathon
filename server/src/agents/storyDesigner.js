import { generateJSON } from "../gemini.js";

/**
 * Agent 2 — Story Designer
 * Transforme la base de connaissances en aventure pédagogique cohérente.
 * NE FAIT PAS : questions, gameplay. Uniquement la narration.
 */

const SYSTEM = `Tu es un game writer spécialisé dans les serious games éducatifs.
Tu transformes des connaissances en aventure narrative immersive et cohérente.
Règles strictes :
- Choisis un univers adapté à la matière (Réseaux -> cybersécurité dans une ville
  numérique ; Biologie -> exploration du corps humain ; Histoire -> voyage temporel ;
  Maths -> royaume régi par les lois mathématiques ; etc.).
- Crée un héros, des personnages secondaires, une intrigue et des chapitres.
- Répartis les notions pédagogiques dans les chapitres.
- N'écris AUCUNE question ni mécanique de jeu.
- Reste cohérent et adapte le ton au niveau scolaire détecté.
- Réponds toujours en français.`;

export async function designStory({ knowledge }) {
  const prompt = `Voici la base de connaissances d'un cours (JSON) :
${JSON.stringify(knowledge, null, 2)}

Conçois une aventure pédagogique. Renvoie STRICTEMENT un objet JSON :
{
  "title": "titre accrocheur du jeu",
  "universe": "description de l'univers (2-3 phrases)",
  "tone": "ton de l'aventure (mystérieux, héroïque, drôle...)",
  "hero": { "name": "nom", "description": "qui est le héros et sa quête" },
  "characters": [
    { "name": "nom", "role": "mentor / allié / antagoniste...", "description": "courte bio" }
  ],
  "story_arc": "résumé de l'intrigue du début à la fin (3-5 phrases)",
  "chapters": [
    {
      "title": "titre du chapitre",
      "summary": "ce qui se passe dans ce chapitre",
      "concepts_covered": ["notions du cours abordées dans ce chapitre"]
    }
  ]
}

Crée entre 3 et 5 chapitres couvrant l'ensemble des notions importantes du cours.`;

  const story = await generateJSON({
    systemInstruction: SYSTEM,
    prompt,
    temperature: 0.9,
  });

  return {
    title: story.title || "Aventure pédagogique",
    universe: story.universe || "",
    tone: story.tone || "aventureux",
    hero: story.hero || { name: "Le héros", description: "" },
    characters: story.characters || [],
    story_arc: story.story_arc || "",
    chapters: story.chapters || [],
  };
}
