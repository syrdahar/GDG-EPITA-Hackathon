import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { pickTheme, HERO_AVATAR } from "../theme.js";

/**
 * Une salle de donjon en vue de dessus. Le joueur déplace son personnage
 * (flèches / ZQSD / pavé tactile) jusqu'à l'autel central pour déclencher la
 * question, puis vers la porte (qui s'ouvre après réponse) pour passer à la
 * salle suivante. Chaque salle est thématisée selon la question.
 */

const COLS = 9;
const ROWS = 7;
const ALTAR = { r: 3, c: 4 };
const EXIT = { r: 0, c: 4 };
const ENTRANCE = { r: 6, c: 4 };
const START = { r: 5, c: 4 };

function isWall(r, c, exitOpen) {
  if (r === EXIT.r && c === EXIT.c) return !exitOpen; // porte verrouillée tant qu'on n'a pas répondu
  if (r === ENTRANCE.r && c === ENTRANCE.c) return false; // ouverture d'entrée
  return r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
}

const CORNERS = [
  { r: 1, c: 1 },
  { r: 1, c: COLS - 2 },
  { r: ROWS - 2, c: 1 },
  { r: ROWS - 2, c: COLS - 2 },
];

export default function DungeonRoom({
  level,
  roomIndex,
  exitOpen,
  answered,
  locked,
  onReachAltar,
  onReachExit,
}) {
  const theme = useMemo(
    () => pickTheme(`${level?.scene_description || ""} ${level?.concept || ""}`),
    [level]
  );

  // Taille de tuile responsive.
  const [tile, setTile] = useState(56);
  useEffect(() => {
    const calc = () => {
      const maxW = Math.min(window.innerWidth - 24, 720);
      const maxH = window.innerHeight - 360;
      const t = Math.floor(Math.min(maxW / COLS, maxH / ROWS));
      setTile(Math.max(34, Math.min(70, t)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Position du personnage, réinitialisée à chaque nouvelle salle.
  const [pos, setPos] = useState(START);
  const altarDone = useRef(false);
  const exitDone = useRef(false);
  useEffect(() => {
    setPos(START);
    altarDone.current = false;
    exitDone.current = false;
  }, [roomIndex]);

  const move = useCallback(
    (dr, dc) => {
      if (locked) return;
      setPos((p) => {
        const nr = p.r + dr;
        const nc = p.c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return p;
        if (isWall(nr, nc, exitOpen)) return p;
        return { r: nr, c: nc };
      });
    },
    [locked, exitOpen]
  );

  // Déclenchements (autel / sortie) selon la position.
  useEffect(() => {
    if (locked) return;
    if (!altarDone.current && pos.r === ALTAR.r && pos.c === ALTAR.c) {
      altarDone.current = true;
      onReachAltar?.();
      return;
    }
    if (!exitDone.current && exitOpen && pos.r === EXIT.r && pos.c === EXIT.c) {
      exitDone.current = true;
      onReachExit?.();
    }
  }, [pos, exitOpen, locked, onReachAltar, onReachExit]);

  // Clavier (flèches + WASD + ZQSD).
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      let dr = 0;
      let dc = 0;
      if (["arrowup", "w", "z"].includes(k)) dr = -1;
      else if (["arrowdown", "s"].includes(k)) dr = 1;
      else if (["arrowleft", "a", "q"].includes(k)) dc = -1;
      else if (["arrowright", "d"].includes(k)) dc = 1;
      else return;
      e.preventDefault();
      move(dr, dc);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const boardW = COLS * tile;
  const boardH = ROWS * tile;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Plateau */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: boardW, height: boardH, boxShadow: `0 0 60px -10px ${theme.accent}66` }}
      >
        {/* Sol + murs */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const wall = isWall(r, c, exitOpen);
            const dark = (r + c) % 2 === 0;
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: c * tile,
                  top: r * tile,
                  width: tile,
                  height: tile,
                  background: wall ? theme.wall : dark ? theme.floorA : theme.floorB,
                  boxShadow: wall
                    ? "inset 0 3px 0 rgba(255,255,255,0.08), inset 0 -4px 6px rgba(0,0,0,0.5)"
                    : "inset 0 0 0 1px rgba(255,255,255,0.03)",
                }}
              />
            );
          })
        )}

        {/* Torches sur les murs latéraux */}
        {[2, 4].map((r) =>
          [0, COLS - 1].map((c) => (
            <motion.div
              key={`t-${r}-${c}`}
              className="absolute rounded-full"
              style={{
                left: c * tile + tile / 2 - 4,
                top: r * tile + tile / 2 - 4,
                width: 8,
                height: 8,
                background: theme.accent,
                boxShadow: `0 0 14px 4px ${theme.accent}`,
              }}
              animate={{ opacity: [0.5, 1, 0.6], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: (r + c) * 0.2 }}
            />
          ))
        )}

        {/* Décor de coin (thème) */}
        {CORNERS.map((cell, i) => (
          <div
            key={`prop-${i}`}
            className="absolute grid place-items-center opacity-80"
            style={{ left: cell.c * tile, top: cell.r * tile, width: tile, height: tile, fontSize: tile * 0.5 }}
          >
            {theme.props[i % theme.props.length]}
          </div>
        ))}

        {/* Porte d'entrée */}
        <div
          className="absolute grid place-items-center"
          style={{ left: ENTRANCE.c * tile, top: ENTRANCE.r * tile, width: tile, height: tile, fontSize: tile * 0.55 }}
        >
          🚪
        </div>

        {/* Autel central (question) */}
        <motion.div
          className="absolute grid place-items-center rounded-xl"
          style={{
            left: ALTAR.c * tile + tile * 0.1,
            top: ALTAR.r * tile + tile * 0.1,
            width: tile * 0.8,
            height: tile * 0.8,
            fontSize: tile * 0.5,
            background: answered ? "rgba(163,230,53,0.12)" : `${theme.accent}22`,
            boxShadow: answered ? "0 0 20px 4px rgba(163,230,53,0.5)" : `0 0 24px 6px ${theme.accent}88`,
          }}
          animate={answered ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          {answered ? "✅" : "❓"}
        </motion.div>

        {/* Porte de sortie (haut) */}
        <motion.div
          className="absolute grid place-items-center"
          style={{ left: EXIT.c * tile, top: EXIT.r * tile, width: tile, height: tile, fontSize: tile * 0.55 }}
          animate={exitOpen ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span style={exitOpen ? { filter: `drop-shadow(0 0 8px ${theme.accent})` } : { opacity: 0.85 }}>
            {exitOpen ? "🟢" : "🔒"}
          </span>
        </motion.div>

        {/* Personnage (le bonhomme) */}
        <motion.div
          className="absolute grid place-items-center z-10 pointer-events-none"
          style={{ width: tile, height: tile, fontSize: tile * 0.6 }}
          animate={{ left: pos.c * tile, top: pos.r * tile }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.6))` }}
          >
            {HERO_AVATAR}
          </motion.span>
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.55)" }} />
      </div>

      {/* Pavé directionnel (tactile / souris) */}
      <div className="grid grid-cols-3 gap-1.5 w-40">
        <span />
        <DPad onClick={() => move(-1, 0)} disabled={locked}>▲</DPad>
        <span />
        <DPad onClick={() => move(0, -1)} disabled={locked}>◀</DPad>
        <DPad onClick={() => move(1, 0)} disabled={locked}>▼</DPad>
        <DPad onClick={() => move(0, 1)} disabled={locked}>▶</DPad>
      </div>
    </div>
  );
}

function DPad({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass h-12 grid place-items-center text-lg active:scale-90 disabled:opacity-30 transition"
    >
      {children}
    </button>
  );
}
