import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api.js";
import Logo from "../components/Logo.jsx";

const PIPELINE = [
  { key: "extracting", agent: "Agent 1", icon: "🧠", label: "Knowledge Extractor", desc: "Extraction des connaissances du PDF" },
  { key: "designing_story", agent: "Agent 2", icon: "🗺️", label: "Story Designer", desc: "Conception de l'univers et de l'intrigue" },
  { key: "designing_game", agent: "Agent 3", icon: "🎮", label: "Game Designer", desc: "Création des niveaux et des QCM" },
];

const SUGGESTIONS = [
  "Ajoute 3 questions supplémentaires",
  "Réduis la difficulté",
  "Remplace l'univers par un univers médiéval",
  "Ajoute plus de narration",
  "Adapte le jeu à des élèves de 5e",
];

function stepIndex(status) {
  if (status === "queued" || status === "extracting") return 0;
  if (status === "designing_story") return 1;
  if (status === "designing_game") return 2;
  if (status === "ready") return 3;
  return 0;
}

export default function TeacherStudio() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");

  // Polling du statut tant que le jeu n'est pas prêt.
  useEffect(() => {
    let timer;
    let active = true;
    async function poll() {
      try {
        const m = await api.status(id);
        if (!active) return;
        setMeta(m);
        if (m.status === "ready") {
          const g = await api.game(id);
          if (active) setGame(g);
          return;
        }
        if (m.status === "error") {
          setError(m.error || "Erreur de génération.");
          return;
        }
        timer = setTimeout(poll, 1500);
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id]);

  const ready = meta?.status === "ready" && game;

  return (
    <div className="min-h-full">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        <Link to="/" className="btn-ghost text-sm">← Accueil</Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {error ? (
          <div className="glass p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="font-display text-xl font-bold">Une erreur est survenue</h2>
            <p className="text-slate-400 mt-2">{error}</p>
            <Link to="/" className="btn-primary mt-6">Réessayer</Link>
          </div>
        ) : !ready ? (
          <GenerationProgress meta={meta} />
        ) : (
          <StudioReady id={id} game={game} setGame={setGame} />
        )}
      </main>
    </div>
  );
}

function GenerationProgress({ meta }) {
  const current = stepIndex(meta?.status);
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-6xl inline-block"
        >
          ⚙️
        </motion.div>
        <h2 className="font-display text-3xl font-bold mt-4">Génération en cours…</h2>
        <p className="text-slate-400 mt-2">
          Nos agents IA fabriquent ton aventure. Patiente quelques instants.
        </p>
      </div>

      <div className="space-y-4">
        {PIPELINE.map((step, i) => {
          const done = current > i;
          const active = current === i;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass p-5 flex items-center gap-4 transition-all ${
                active ? "ring-2 ring-neon-violet shadow-glow" : ""
              } ${done ? "opacity-70" : ""}`}
            >
              <div className="text-3xl">{done ? "✅" : step.icon}</div>
              <div className="flex-1">
                <div className="text-xs text-neon-violet font-semibold">{step.agent}</div>
                <div className="font-display font-bold">{step.label}</div>
                <div className="text-sm text-slate-400">{step.desc}</div>
              </div>
              {active && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-neon-cyan"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StudioReady({ id, game, setGame }) {
  const shareUrl = `${window.location.origin}/play/${id}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      {/* Bandeau succès + partage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <span className="chip text-neon-lime mb-2">✅ Jeu prêt</span>
            <h1 className="font-display text-3xl font-bold">{game.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {game.subject} · niveau {game.level} · {game.levels.length} niveaux · difficulté {game.difficulty}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={`/play/${id}`} className="btn-cyan">▶ Jouer</Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300"
          />
          <button onClick={copy} className="btn-primary whitespace-nowrap">
            {copied ? "✓ Copié !" : "🔗 Copier le lien"}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Partage ce lien : chaque élève joue la même aventure avec sa propre progression.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Aperçu du jeu */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass p-6">
            <h2 className="font-display text-lg font-bold mb-2">🌍 Univers</h2>
            <p className="text-slate-300 text-sm">{game.universe}</p>
            {game.hero && (
              <p className="text-slate-400 text-sm mt-3">
                <span className="text-neon-cyan font-semibold">{game.hero.name}</span> — {game.hero.description}
              </p>
            )}
            {game.characters?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {game.characters.map((c, i) => (
                  <span key={i} className="chip">{c.name} · {c.role}</span>
                ))}
              </div>
            )}
          </div>

          <div className="glass p-6">
            <h2 className="font-display text-lg font-bold mb-3">📚 Niveaux ({game.levels.length})</h2>
            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-2">
              {game.levels.map((lvl, i) => (
                <details key={lvl.id} className="bg-black/20 rounded-xl border border-white/5 p-3">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                    <span className="text-neon-violet">#{i + 1}</span>
                    <span className="flex-1">{lvl.question}</span>
                    <span className="chip">{lvl.concept}</span>
                  </summary>
                  <div className="mt-3 text-sm space-y-1 text-slate-300">
                    <p className="italic text-slate-400">🎬 {lvl.scene_description}</p>
                    {Object.entries(lvl.choices).map(([k, v]) => (
                      <p key={k} className={k === lvl.correct_answer ? "text-neon-lime" : ""}>
                        {k}. {v} {k === lvl.correct_answer && "✓"}
                      </p>
                    ))}
                    <p className="text-slate-400 mt-1">💡 {lvl.explanation}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Chatbot d'édition (Agent 4) */}
        <div className="lg:col-span-2">
          <EditorChat id={id} game={game} setGame={setGame} />
        </div>
      </div>
    </div>
  );
}

function EditorChat({ id, game, setGame }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour 👋 Je suis ton assistant d'édition. Dis-moi ce que tu veux changer dans le jeu." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const command = (text ?? input).trim();
    if (!command || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: command }]);
    setBusy(true);
    try {
      const { message, game: updated } = await api.edit(id, command);
      setGame(updated);
      setMessages((m) => [...m, { role: "assistant", text: message }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass p-5 flex flex-col h-[40rem]">
      <h2 className="font-display text-lg font-bold mb-1">🤖 Éditeur IA</h2>
      <p className="text-xs text-slate-500 mb-3">Agent 4 · Teacher Editor</p>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-neon-violet to-neon-pink text-white"
                    : "bg-white/10 text-slate-200"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-400">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
                ✍️ Modification en cours…
              </motion.span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2 my-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="text-xs chip hover:bg-white/20 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ex : ajoute 5 questions sur…"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-violet"
          disabled={busy}
        />
        <button onClick={() => send()} disabled={busy} className="btn-primary px-4">
          ➤
        </button>
      </div>
    </div>
  );
}
