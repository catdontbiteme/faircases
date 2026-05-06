import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#fafaf7",
        accent: "#c2410c",
        muted: "#737373",
        rule: "#e5e5e0",
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Noto Serif TC"', "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
