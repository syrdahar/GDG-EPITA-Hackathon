import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api.js";
import Logo from "../components/Logo.jsx";

const STEPS = [
  { icon: "📄", title: "Dépose ton PDF", desc: "Un cours, un chapitre, des notes." },
  { icon: "🧠", title: "L'IA extrait le savoir", desc: "Concepts, définitions, objectifs." },
  { icon: "🗺️", title: "Une histoire naît", desc: "Univers, héros, intrigue cohérente." },
  { icon: "🎮", title: "Un jeu jouable", desc: "Niveaux, énigmes, QCM explicatifs." },
];

export default function Home() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.list().then(setGames).catch(() => {});
  }, []);

  function onPick(f) {
    setError("");
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Merci de déposer un fichier PDF.");
      return;
    }
    setFile(f);
  }

  async function handleGenerate() {
    setError("");
    if (!file && health?.mode !== "demo") {
      setError("Ajoute un PDF d'abord (ou configure une clé Gemini pour le mode démo).");
      return;
    }
    setLoading(true);
    try {
      const { id } = await api.generate(file);
      navigate(`/studio/${id}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        {health && (
          <span className={`chip ${health.mode === "live" ? "text-neon-lime" : "text-amber-300"}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {health.mode === "live" ? `IA active · ${health.model}` : "Mode démo"}
          </span>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Transforme un cours
          <br />
          en <span className="bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink bg-clip-text text-transparent">aventure jouable</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto"
        >
          Dépose un PDF. Une équipe d'agents IA en fait un serious game éducatif,
          partageable à toute ta classe via un simple lien.
        </motion.p>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onPick(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className={`glass cursor-pointer p-10 transition-all duration-200 ${
              dragging ? "ring-2 ring-neon-violet scale-[1.02]" : "hover:bg-white/10"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => onPick(e.target.files?.[0])}
            />
            <div className="text-5xl mb-3">{file ? "✅" : "📄"}</div>
            <p className="font-semibold text-lg">
              {file ? file.name : "Glisse ton PDF ici"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {file ? "Prêt à être transformé" : "ou clique pour choisir un fichier"}
            </p>
          </div>

          {error && <p className="mt-4 text-pink-400 text-sm">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full mt-6 text-lg py-4"
          >
            {loading ? "Lancement…" : "✨ Générer le jeu"}
          </button>
          {health?.mode === "demo" && (
            <p className="mt-3 text-xs text-amber-300/80">
              Mode démo actif : génère un jeu d'exemple même sans PDF.
            </p>
          )}
        </motion.div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 text-left"
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-xs text-neon-violet font-semibold mb-1">ÉTAPE {i + 1}</div>
              <h3 className="font-display font-bold text-lg">{s.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      {games.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="font-display text-2xl font-bold mb-5">🕹️ Aventures récentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => (
              <Link
                key={g.id}
                to={g.status === "ready" ? `/play/${g.id}` : `/studio/${g.id}`}
                className="glass p-5 hover:bg-white/10 transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between">
                  <span className="chip">{g.subject || "Cours"}</span>
                  <span className={`text-xs ${g.status === "ready" ? "text-neon-lime" : "text-amber-300"}`}>
                    {g.status === "ready" ? "▶ Jouable" : "⏳ En cours"}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mt-3 group-hover:text-neon-cyan transition">
                  {g.title || g.filename || "Aventure"}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {g.levelCount ? `${g.levelCount} niveaux` : "—"} · {g.level || ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-slate-500 text-sm">
        EduQuest AI · Architecture multi-agents · GDG EPITA Hackathon
      </footer>
    </div>
  );
}
