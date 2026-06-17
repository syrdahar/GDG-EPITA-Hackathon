# EduQuest AI - Architecture Agentique

## Vision

Créer une plateforme permettant à un enseignant de déposer un PDF de cours et de générer automatiquement un jeu vidéo éducatif interactif partageable via un simple lien web.

Le jeu est généré une seule fois par cours.

Tous les élèves jouent à la même aventure, chacun de manière indépendante.

L'objectif est de transformer un contenu pédagogique statique en expérience ludique favorisant l'engagement et la mémorisation.

---

# Architecture globale

```text
PDF du cours
      │
      ▼
┌─────────────────────┐
│ Agent 1             │
│ Knowledge Extractor │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Agent 2             │
│ Story Designer      │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Agent 3             │
│ Game Designer       │
└─────────────────────┘
      │
      ▼
 Jeu JSON complet
      │
      ▼
┌─────────────────────┐
│ Agent 4             │
│ Teacher Editor      │
└─────────────────────┘
      │
      ▼
 Jeu final partageable
```

---

# Agent 1 — Knowledge Extractor

## Mission

Analyser le PDF et construire une base de connaissances exhaustive.

## Responsabilités

- Extraction du texte
- Nettoyage du contenu
- Identification des notions importantes
- Extraction des définitions
- Extraction des dates
- Extraction des formules
- Extraction des mécanismes
- Identification des objectifs pédagogiques
- Détection des notions évaluables

## Sortie

```json
{
  "concepts": [],
  "definitions": [],
  "formulas": [],
  "important_facts": [],
  "learning_objectives": []
}
```

## Stockage Redis

Une fois la base de connaissances générée, l'ensemble des données structurées doit être persisté dans Redis.

Objectifs :

- partager les connaissances entre les agents ;
- éviter de retraiter le PDF ;
- permettre des modifications incrémentales du jeu ;
- accélérer les temps de génération ;
- conserver l'état du projet entre plusieurs sessions.

Flux :

```text
PDF
  │
  ▼
Agent 1
  │
  ▼
Base de connaissances
  │
  ▼
Redis
  │
  ├──► Agent 2 (Story Designer)
  ├──► Agent 3 (Game Designer)
  └──► Agent 4 (Teacher Editor)
```

Redis devient la source de vérité intermédiaire utilisée par tous les agents.

## Contraintes

- Ne réaliser aucun game design
- Ne créer aucune question
- Ne créer aucun scénario
- Se limiter à la structuration des connaissances

---

# Agent 2 — Story Designer

## Mission

Transformer la base de connaissances en aventure pédagogique cohérente.

## Responsabilités

- Choisir un univers adapté au cours
- Créer un héros
- Créer des personnages secondaires
- Construire une intrigue
- Définir les chapitres
- Répartir les notions pédagogiques dans l'aventure
- Maintenir la cohérence narrative

## Exemples d'univers

### Réseaux

Mission de cybersécurité dans une ville numérique.

### Biologie

Exploration du corps humain.

### Histoire

Voyage temporel.

### Mathématiques

Exploration d'un royaume fondé sur les lois mathématiques.

## Sortie

```json
{
  "title": "",
  "universe": "",
  "characters": [],
  "chapters": [],
  "story_arc": ""
}
```

## Contraintes

- Aucune génération de questions
- Aucune génération de gameplay
- Uniquement la narration

---

# Agent 3 — Game Designer

## Mission

Transformer le scénario en jeu vidéo pédagogique.

## Responsabilités

- Création des niveaux
- Génération des scènes
- Génération des dialogues
- Génération des QCM
- Génération des explications pédagogiques
- Définition de la progression du joueur

## Format des questions

Chaque question doit contenir :

- Énoncé
- Réponse A
- Réponse B
- Réponse C
- Réponse D
- Bonne réponse
- Explication

Une seule réponse correcte.

## Gameplay

Pour chaque étape :

1. Afficher une scène.
2. Afficher la narration.
3. Afficher la question.
4. L'élève répond.
5. Vérifier la réponse.
6. Donner une explication.
7. Continuer l'aventure.

## Visuels

Ne pas générer d'images.

Produire uniquement des descriptions visuelles permettant au moteur graphique de générer des scènes minimalistes cohérentes.

Exemple :

```text
Temple ancien envahi par la végétation.
Ambiance mystérieuse.
Une porte verrouillée bloque la progression.
```

## Sortie

```json
{
  "title": "",
  "story": "",
  "levels": [
    {
      "scene_description": "",
      "narrative": "",
      "question": "",
      "choices": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_answer": "",
      "explanation": ""
    }
  ]
}
```

---

# Agent 4 — Teacher Editor

## Mission

Permettre au professeur de modifier le jeu via un chatbot.

## Exemples de commandes

- Remplace l'univers spatial par un univers médiéval.
- Ajoute 10 questions supplémentaires.
- Réduis la difficulté.
- Augmente la difficulté.
- Ajoute davantage de narration.
- Réécris les explications.
- Rends les visuels plus colorés.
- Adapte le jeu à des élèves de 5e.
- Adapte le jeu à des étudiants de licence.

## Contraintes

- Modifier uniquement les éléments concernés.
- Éviter la régénération complète du jeu.
- Préserver la cohérence globale.

---

# Contraintes globales

## Objectif pédagogique

Le jeu doit favoriser :

- la compréhension ;
- la mémorisation ;
- l'engagement ;
- la révision active.

## Durée

- 10 à 20 minutes maximum.

## Difficulté

Adaptée automatiquement au niveau scolaire détecté.

## Robustesse

- Ne jamais inventer des notions absentes du cours.
- Toujours conserver un lien explicite avec les contenus pédagogiques.

## Partage

Le jeu est généré une seule fois puis partagé via une URL.

Chaque élève dispose de sa propre progression mais joue au même contenu.

---

# Pitch Hackathon

« EduQuest AI transforme automatiquement un cours PDF en aventure vidéoludique éducative. Grâce à une architecture multi-agents, l'IA extrait les connaissances, construit une histoire cohérente, génère un jeu interactif et permet à l'enseignant de le modifier simplement via un chatbot. Le résultat est un serious game partageable instantanément à toute une classe via un simple lien web. »
