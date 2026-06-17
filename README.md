# 🎮 EduQuest AI

> Transforme un **PDF de cours** en **jeu vidéo éducatif** jouable et partageable via un simple lien — grâce à une architecture **multi-agents IA**.

Projet **GDG EPITA Hackathon**.

---

## ✨ Le concept

Un enseignant dépose un PDF. Une équipe d'agents IA :

1. **🧠 Knowledge Extractor** — extrait concepts, définitions, formules, objectifs du PDF.
2. **🗺️ Story Designer** — invente un univers, un héros, une intrigue cohérente.
3. **🎮 Game Designer** — génère des niveaux jouables (scènes, narration, QCM, explications).
4. **🤖 Teacher Editor** — un chatbot pour modifier le jeu en langage naturel.

Le jeu est généré **une seule fois** puis partagé via une **URL**. Chaque élève joue la
même aventure avec **sa propre progression**.

---

## 🏗️ Architecture

```
        PDF
         │
   ┌─────▼─────────────┐
   │ Agent 1  Knowledge│──┐
   │          Extractor│  │
   └─────┬─────────────┘  │
         │                │
   ┌─────▼─────────────┐  │   ┌─────────┐
   │ Agent 2  Story    │  ├──▶│  Redis  │  (source de vérité partagée)
   │          Designer │  │   └─────────┘
   └─────┬─────────────┘  │
         │                │
   ┌─────▼─────────────┐  │
   │ Agent 3  Game     │──┘
   │          Designer │
   └─────┬─────────────┘
         │
   Jeu JSON complet ──▶ 🔗 lien partageable
         │
   ┌─────▼─────────────┐
   │ Agent 4  Teacher  │  (édition par chatbot)
   │          Editor   │
   └───────────────────┘
```

- **Backend** : Node.js + Express, SDK **Google Gemini** (lecture PDF native), **Redis**
  comme source de vérité partagée entre agents (fallback mémoire+disque si Redis absent).
- **Frontend** : React + Vite + Tailwind + Framer Motion (UI animée, scènes procédurales).

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js ≥ 20
- (Optionnel) Docker pour Redis
- (Optionnel) Une clé API Gemini gratuite : https://aistudio.google.com/app/apikey

### 2. Installation
```bash
npm install            # installe racine + server + client (workspaces)
cp .env.example .env   # puis renseigne GEMINI_API_KEY (sinon : mode démo)
```

### 3. (Optionnel) Redis
```bash
docker compose up -d   # lance Redis sur localhost:6379
```
> Sans Redis, l'app bascule automatiquement sur un store mémoire + disque (`data/`).

### 4. Lancer en dev
```bash
npm run dev            # backend :3001 + frontend :5173
```
Ouvre **http://localhost:5173**.

### 5. Build de production
```bash
npm run build          # build le frontend
npm start              # serveur Express qui sert l'app + l'API sur :3001
```

---

## 🎛️ Modes

| | Sans `GEMINI_API_KEY` | Avec `GEMINI_API_KEY` |
|---|---|---|
| **Mode** | 🟡 Démo | 🟢 Live |
| Génération | Jeu d'exemple (Réseaux) | Vraie analyse IA du PDF |
| Édition chatbot | Simulée | Réelle (Agent 4) |

Le mode démo permet de présenter **tout le flux** sans clé API.

---

## 🔌 API

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/health` | État (mode démo/live, store) |
| `POST` | `/api/generate` | Upload PDF → lance le pipeline (renvoie `id`) |
| `GET` | `/api/games/:id/status` | Statut de génération (polling) |
| `GET` | `/api/games/:id` | Jeu complet |
| `GET` | `/api/games` | Galerie des jeux |
| `POST` | `/api/games/:id/edit` | Édition via chatbot (Agent 4) |

---

## 📁 Structure

```
.
├── server/                 # Backend Node/Express
│   └── src/
│       ├── agents/         # Les 4 agents IA
│       ├── pipeline.js     # Orchestration multi-agents
│       ├── store.js        # Redis + fallback
│       ├── gemini.js       # Client Gemini
│       └── index.js        # API Express
├── client/                 # Frontend React/Vite
│   └── src/
│       ├── pages/          # Home · TeacherStudio · GamePlayer
│       └── components/     # SceneBackground, Logo
└── docker-compose.yml      # Redis
```
