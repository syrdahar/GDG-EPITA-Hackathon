/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0a0a14",
        surface: "#13131f",
        neon: {
          cyan: "#22d3ee",
          violet: "#a855f7",
          pink: "#ec4899",
          lime: "#a3e635",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(168,85,247,0.6)",
        "glow-cyan": "0 0 40px -10px rgba(34,211,238,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
