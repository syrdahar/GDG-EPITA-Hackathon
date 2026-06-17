// Thèmes visuels dérivés du texte d'une scène/concept.
// Partagé par le fond d'écran (SceneBackground) et le donjon (DungeonRoom),
// pour que chaque salle ait une ambiance cohérente avec sa question.

const THEMES = [
  {
    id: "cyber",
    keys: ["cyber", "numérique", "réseau", "néon", "data", "ville", "hacker", "informatique", "ordinateur", "code", "protocole", "internet"],
    from: "#0ea5e9", via: "#6366f1", to: "#0a0a14",
    motifs: ["⬡", "▦", "✦", "◈"],
    floorA: "#11193a", floorB: "#0c1430", wall: "#243b6b", accent: "#22d3ee",
    props: ["🖥️", "🛰️", "💾", "🔌"],
  },
  {
    id: "nature",
    keys: ["temple", "ancien", "ruine", "végétation", "jungle", "forêt", "nature", "plante", "arbre", "écologie"],
    from: "#16a34a", via: "#065f46", to: "#0a0a14",
    motifs: ["🌿", "🍃", "✦", "❂"],
    floorA: "#14321f", floorB: "#0f2618", wall: "#2f5d3a", accent: "#a3e635",
    props: ["🌿", "🪴", "🍄", "🗿"],
  },
  {
    id: "space",
    keys: ["espace", "spatial", "galaxie", "étoile", "planète", "cosmos", "astre", "univers", "fusée"],
    from: "#7c3aed", via: "#1e3a8a", to: "#0a0a14",
    motifs: ["✦", "★", "✶", "◦"],
    floorA: "#1a1340", floorB: "#120c30", wall: "#3b2d7a", accent: "#a855f7",
    props: ["🪐", "🚀", "☄️", "🛸"],
  },
  {
    id: "bio",
    keys: ["corps", "cellule", "biologie", "organe", "sang", "adn", "humain", "muscle", "anatomie", "santé", "virus"],
    from: "#e11d48", via: "#9d174d", to: "#0a0a14",
    motifs: ["❤", "✦", "◍", "✧"],
    floorA: "#3a1326", floorB: "#2a0e1c", wall: "#7a2d4d", accent: "#ec4899",
    props: ["🧬", "🦠", "🫀", "💉"],
  },
  {
    id: "history",
    keys: ["temps", "histoire", "passé", "médiéval", "château", "roi", "guerre", "révolution", "antiquité", "époque", "siècle"],
    from: "#d97706", via: "#7c2d12", to: "#0a0a14",
    motifs: ["⌛", "✦", "⚜", "❖"],
    floorA: "#3a2a14", floorB: "#2a1e0e", wall: "#7a5a2d", accent: "#f59e0b",
    props: ["⚜️", "🏰", "🛡️", "⚔️"],
  },
  {
    id: "math",
    keys: ["math", "royaume", "nombre", "géométrie", "équation", "formule", "calcul", "algèbre", "fonction", "théorème"],
    from: "#0891b2", via: "#4338ca", to: "#0a0a14",
    motifs: ["∑", "π", "√", "∞"],
    floorA: "#13233a", floorB: "#0e1a2a", wall: "#2d4d7a", accent: "#38bdf8",
    props: ["📐", "🔢", "♾️", "📊"],
  },
  {
    id: "fire",
    keys: ["feu", "lave", "volcan", "urgence", "danger", "chaleur", "combustion", "énergie"],
    from: "#ea580c", via: "#991b1b", to: "#0a0a14",
    motifs: ["✦", "▲", "✶", "◆"],
    floorA: "#3a1a14", floorB: "#2a120e", wall: "#7a3a2d", accent: "#f97316",
    props: ["🔥", "🌋", "🪨", "🗝️"],
  },
  {
    id: "ice",
    keys: ["glace", "neige", "froid", "hiver", "cristal", "polaire", "givre"],
    from: "#38bdf8", via: "#1e40af", to: "#0a0a14",
    motifs: ["❄", "✦", "◇", "✧"],
    floorA: "#14283a", floorB: "#0e1e2a", wall: "#2d567a", accent: "#7dd3fc",
    props: ["❄️", "🧊", "💎", "🏔️"],
  },
];

const DEFAULT = {
  id: "arcane",
  from: "#a855f7", via: "#3b0764", to: "#0a0a14",
  motifs: ["✦", "◈", "✧", "◦"],
  floorA: "#241544", floorB: "#1a0f33", wall: "#4a2d7a", accent: "#c084fc",
  props: ["🗝️", "🕯️", "📜", "🔮"],
};

export function pickTheme(text = "") {
  const t = (text || "").toLowerCase();
  for (const theme of THEMES) {
    if (theme.keys.some((k) => t.includes(k))) return theme;
  }
  return DEFAULT;
}

// Avatar de l'aventurier (le "bonhomme" déplacé dans le donjon).
export const HERO_AVATAR = "🧙";
