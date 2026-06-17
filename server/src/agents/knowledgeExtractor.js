import { generateJSON } from "../gemini.js";

/**
 * Agent 1 — Knowledge Extractor
 * Analyse le PDF et construit une base de connaissances exhaustive.
 * NE FAIT PAS : game design, questions, scénario. Uniquement la structuration.
 */

const SYSTEM = `Tu es un expert pédagogique chargé d'analyser un cours.
Ta SEULE mission est d'EXTRAIRE et STRUCTURER les connaissances du document fourni.
Règles strictes :
- N'invente JAMAIS de notion absente du document.
- Ne crée aucune question, aucun scénario, aucun jeu.
- Reste fidèle au contenu pédagogique source.
- Réponds toujours en français.`;

export async function extractKnowledge({ pdfBase64 }) {
  const prompt = `Analyse le PDF de cours ci-joint et produis une base de connaissances structurée.

Renvoie STRICTEMENT un objet JSON avec cette forme exacte :
{
  "detected_subject": "matière détectée (ex: Réseaux, Biologie, Histoire, Mathématiques...)",
  "detected_level": "niveau scolaire estimé (ex: collège 5e, lycée, licence...)",
  "summary": "résumé du cours en 2-3 phrases",
  "concepts": [
    { "name": "nom du concept", "description": "explication claire et concise" }
  ],
  "definitions": [
    { "term": "terme", "definition": "définition exacte issue du cours" }
  ],
  "formulas": [
    { "name": "nom", "formula": "expression", "explanation": "à quoi elle sert" }
  ],
  "important_facts": [
    "fait, date ou information clé à retenir"
  ],
  "learning_objectives": [
    "objectif pédagogique formulé en 'L'élève sera capable de...'"
  ]
}

Sois exhaustif sur les notions importantes et évaluables. Si une section n'a pas de contenu (ex: pas de formules), renvoie un tableau vide.`;

  const knowledge = await generateJSON({
    systemInstruction: SYSTEM,
    prompt,
    pdfBase64,
    temperature: 0.3,
  });

  // Garantit la présence de tous les champs attendus.
  return {
    detected_subject: knowledge.detected_subject || "Général",
    detected_level: knowledge.detected_level || "non précisé",
    summary: knowledge.summary || "",
    concepts: knowledge.concepts || [],
    definitions: knowledge.definitions || [],
    formulas: knowledge.formulas || [],
    important_facts: knowledge.important_facts || [],
    learning_objectives: knowledge.learning_objectives || [],
  };
}
