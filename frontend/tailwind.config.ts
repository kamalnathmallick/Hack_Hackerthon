import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#f6f8fb",
          panel: "#ffffff",
          text: "#0f172a",
          accent: "#0369a1",
          accentSoft: "#e0f2fe"
        }
      }
    }
  },
  plugins: []
};

export default config;
