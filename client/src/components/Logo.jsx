import { Link } from "react-router-dom";

export default function Logo({ size = "text-2xl" }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <span className="text-3xl group-hover:animate-float">🎮</span>
      <span className={`font-display font-extrabold tracking-tight ${size}`}>
        Edu<span className="bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink bg-clip-text text-transparent">Quest</span>
        <span className="text-slate-400 font-semibold"> AI</span>
      </span>
    </Link>
  );
}
