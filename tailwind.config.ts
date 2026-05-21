import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        panel: "#111111",
        panelSoft: "#1a1a1a",
        accent: "#1DB954",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(29,185,84,0.14), 0 18px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;