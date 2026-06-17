import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api.js";
import Logo from "../components/Logo.jsx";
import SceneBackground from "../components/SceneBackground.jsx";
import DungeonRoom from "../components/DungeonRoom.jsx";

const LETTERS = ["A", "B", "C", "D"];

function loadProgress(id) {
  try {
    return JSON.parse(localStorage.getItem(`eduquest:progress:${id}`)) || null;
  } catch {
    return null;
  }
}
function saveProgress(id, p) {
  localStorage.setItem(`eduquest:progress:${id}`, JSON.stringify(p));
}

export default function GamePlayer() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [pending, setPending] = useState(null); // jeu en cours de génération
  const [error, setError] = useState("");

  // phases : "intro" | "playing" | "finished"
  const [phase, setPhase] = useState("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timer, active = true;
    async function load() {
      try {
        const res = await api.game(id);
        if (!active) return;
        if (res.status && res.status !== "ready") {
          setPending(res.status);
          timer = setTimeout(load, 1800);
          return;
        }
        setPending(null);
        setGame(res);
        // Reprise de progression locale.
        const p = loadProgress(id);
        if (p && p.completed) {
          setScore(p.score);
          setPhase("finished");
        } else if (p && typeof p.index === "number") {
          setIndex(p.index);
          setScore(p.score || 0);
          setPhase(p.index > 0 ? "playing" : "intro");
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    load();
    return () => { active = false; clearTimeout(timer); };
  }, [id]);

  if (error) {
    return (
      <Centered>
        <div className="glass p-8 text-center max-w-md">
          <div className="text-4xl mb-3">😕</div>
          <h2 className="font-display text-xl font-bold">Jeu introuvable</h2>
          <p className="text-slate-400 mt-2">{error}</p>
          <Link to="/" className="btn-primary mt-6">Accueil</Link>
        </div>
      </Centered>
    );
  }

  if (pending) {
    return (
      <Centered>
        <div className="glass p-8 text-center max-w-md">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-5xl">⚙️</motion.div>
          <h2 className="font-display text-xl font-bold mt-4">Le jeu se prépare…</h2>
          <p className="text-slate-400 mt-2">L'aventure est en cours de création. Ça arrive !</p>
        </div>
      </Centered>
    );
  }

  if (!game) {
    return <Centered><div className="text-slate-400">Chargement…</div></Centered>;
  }

  const total = game.levels.length;
  const level = game.levels[index];

  // Le personnage atteint l'autel -> ouvre la question (sauf si déjà répondu).
  function handleReachAltar() {
    if (selected) return;
    setQuestionOpen(true);
  }

  function answer(letter) {
    if (selected) return;
    setSelected(letter);
    const correct = letter === level.correct_answer;
    if (correct) setScore((s) => s + 1);
    saveProgress(id, { index, score: score + (correct ? 1 : 0), completed: false });
  }

  // Ferme la question : la porte s'ouvre, le joueur marche jusqu'à elle.
  function closeQuestion() {
    setQuestionOpen(false);
  }

  // Le personnage atteint la porte de sortie -> salle suivante.
  function next() {
    setSelected(null);
    setQuestionOpen(false);
    if (index + 1 >= total) {
      saveProgress(id, { index: total, score, completed: true });
      setPhase("finished");
    } else {
      const ni = index + 1;
      setIndex(ni);
      saveProgress(id, { index: ni, score, completed: false });
    }
  }

  function restart() {
    saveProgress(id, { index: 0, score: 0, completed: false });
    setIndex(0);
    setScore(0);
    setSelected(null);
    setQuestionOpen(false);
    setPhase("intro");
  }

  // ─── INTRO ──────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <Shell text={game.universe + " " + game.subject}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 max-w-2xl text-center"
        >
          <span className="chip mb-4">{game.subject} · {game.level}</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold">{game.title}</h1>
          <p className="text-slate-300 mt-4">{game.universe}</p>
          {game.story && <p className="text-slate-400 mt-4 italic">« {game.story} »</p>}
          {game.hero && (
            <p className="text-sm text-neon-cyan mt-4">
              Tu incarnes <strong>{game.hero.name}</strong>
            </p>
          )}
          <button onClick={() => setPhase("playing")} className="btn-primary text-lg mt-8 px-8">
            🚀 Commencer l'aventure
          </button>
          <p className="text-xs text-slate-500 mt-3">{total} niveaux · ~{Math.max(5, Math.round(total * 1.5))} min</p>
        </motion.div>
      </Shell>
    );
  }

  // ─── FINISHED ───────────────────────────────────────────────────────────
  if (phase === "finished") {
    const pct = Math.round((score / total) * 100);
    const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
    return (
      <Shell text={game.universe}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-10 max-w-lg text-center">
          <div className="text-6xl mb-2">{pct >= 50 ? "🏆" : "🎯"}</div>
          <h1 className="font-display text-3xl font-bold">Aventure terminée !</h1>
          <div className="text-2xl mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < stars ? "" : "opacity-20"}>⭐</span>
            ))}
          </div>
          <p className="text-5xl font-display font-extrabold mt-4 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            {score}/{total}
          </p>
          <p className="text-slate-400 mt-2">{pct}% de bonnes réponses</p>
          <div className="flex gap-3 justify-center mt-8">
            <button onClick={restart} className="btn-ghost">🔄 Rejouer</button>
            <Link to="/" className="btn-primary">Accueil</Link>
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ─── PLAYING ────────────────────────────────────────────────────────────
  const correct = selected && selected === level.correct_answer;

  const hint = !selected
    ? "🧭 Déplace-toi jusqu'à l'autel ❓ pour révéler l'énigme"
    : "🟢 La porte s'est ouverte en haut — rejoins-la pour continuer !";

  return (
    <Shell text={level.scene_description} seed={index + 1}>
      {/* Barre de progression */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Logo size="text-lg" />
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink"
              animate={{ width: `${(index / total) * 100}%` }}
            />
          </div>
          <span className="chip">Salle {index + 1}/{total}</span>
          <span className="chip text-neon-lime">⭐ {score}</span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-3 pt-16 pb-4">
        {/* Placard de salle */}
        <div className="text-center">
          {level.chapter && <span className="chip mb-2">{level.chapter}</span>}
          <h2 className="font-display text-xl font-bold">
            Salle {index + 1} · <span className="text-neon-cyan">{level.concept || "Énigme"}</span>
          </h2>
        </div>

        {/* Le donjon */}
        <DungeonRoom
          level={level}
          roomIndex={index}
          exitOpen={!!selected}
          answered={!!selected}
          locked={questionOpen}
          onReachAltar={handleReachAltar}
          onReachExit={next}
        />

        {/* Indice */}
        <motion.p
          key={hint}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-slate-300 glass px-4 py-2"
        >
          {hint}
        </motion.p>
        <p className="text-xs text-slate-500">Flèches ou ZQSD / WASD · ou le pavé tactile</p>
      </div>

      {/* Overlay question (déclenché à l'autel) */}
      <AnimatePresence>
        {questionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Narration */}
              <div className="bg-black/20 rounded-xl p-4 mb-4">
                <p className="text-slate-200 leading-relaxed text-sm">{level.narrative}</p>
              </div>

              <h2 className="font-display text-2xl font-bold mb-5">{level.question}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LETTERS.map((letter) => {
                  const isPicked = selected === letter;
                  const isCorrect = letter === level.correct_answer;
                  let cls = "glass p-4 text-left transition-all duration-200 ";
                  if (!selected) cls += "hover:bg-white/15 hover:scale-[1.02] cursor-pointer";
                  else if (isCorrect) cls += "ring-2 ring-neon-lime bg-neon-lime/10";
                  else if (isPicked) cls += "ring-2 ring-pink-500 bg-pink-500/10";
                  else cls += "opacity-50";
                  return (
                    <button key={letter} onClick={() => answer(letter)} disabled={!!selected} className={cls}>
                      <span className="font-display font-bold text-neon-violet mr-2">{letter}.</span>
                      {level.choices[letter]}
                      {selected && isCorrect && " ✅"}
                      {selected && isPicked && !isCorrect && " ❌"}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-5"
                  >
                    <div className={`glass p-5 border-l-4 ${correct ? "border-neon-lime" : "border-pink-500"}`}>
                      <p className="font-display font-bold mb-1">
                        {correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait."}
                      </p>
                      <p className="text-slate-300 text-sm">💡 {level.explanation}</p>
                    </div>
                    <button onClick={closeQuestion} className="btn-primary w-full mt-4 text-lg">
                      {index + 1 >= total ? "🚪 Sortir vers le score" : "🚪 La porte s'ouvre — explorer"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ text, seed = 0, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <SceneBackground text={text} seed={seed} />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="min-h-screen flex items-center justify-center p-6">{children}</div>;
}
