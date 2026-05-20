import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs officielles RATP (https://www.ratp.fr) — synthèse fidèle
        ratp: {
          1: "#FFCD00",
          2: "#0064B0",
          3: "#9F9825",
          "3bis": "#98D4E2",
          4: "#C04191",
          5: "#F28E42",
          6: "#83C491",
          7: "#F3A4BA",
          "7bis": "#83C491",
          8: "#CEADD2",
          9: "#D5C900",
          10: "#E3B32A",
          11: "#8D5E2A",
          12: "#00814F",
          13: "#98D4E2",
          14: "#662483",
        },
        ink: {
          DEFAULT: "#0B0F1A",
          soft: "#1A2030",
          muted: "#5B6275",
        },
        cream: "#FAF8F3",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(11,15,26,0.18)",
        glow: "0 0 0 6px rgba(102,36,131,0.18)",
      },
      animation: {
        "fade-in": "fadeIn .35s ease-out both",
        "pop": "pop .25s cubic-bezier(.2,.9,.3,1.4) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
