import { motion } from "framer-motion";
import { useMemo } from "react";
import { pickTheme } from "../theme.js";

/**
 * Moteur de scène minimaliste : pas d'images générées, on dérive une ambiance
 * visuelle (dégradés + motifs flottants) à partir de la description textuelle
 * de la scène, comme prévu par l'architecture (descriptions visuelles -> moteur).
 */

export default function SceneBackground({ text = "", seed = 0, children }) {
  const theme = useMemo(() => pickTheme(text), [text]);
  const shapes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        motif: theme.motifs[i % theme.motifs.length],
        left: ((i * 53 + seed * 17) % 100),
        top: ((i * 31 + seed * 41) % 100),
        size: 14 + ((i * 7 + seed) % 40),
        delay: (i % 6) * 0.4,
        duration: 5 + (i % 5),
      })),
    [theme, seed]
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${theme.from}55, transparent 55%), radial-gradient(circle at 75% 70%, ${theme.via}66, transparent 55%), linear-gradient(160deg, ${theme.via}, ${theme.to})`,
      }}
    >
      {shapes.map((s, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, color: theme.from }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -18, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {s.motif}
        </motion.span>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      {children}
    </div>
  );
}
