import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        // 「深夜檔案室」palette — 重、冷、靜、留有一盞將熄燭光
        paper: "#14171a", // 深石墨灰底
        ink: "#d6d3c0", // 極淺米黃字
        accent: "#92400e", // 暗琥珀（將熄燭光）
        muted: "#7a7568", // 微滲灰，用於次要文字
        rule: "#2a2e33", // 暗紅褐分隔線
        // surface 用於卡片底，比 paper 略亮一點，做出層次
        surface: "#1c2025",
        surfaceHi: "#22272d", // hover / 強調 surface
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
