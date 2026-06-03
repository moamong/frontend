import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fffaf0",
        ink: "#2e2722",
        peach: "#f8c8a0",
        coral: "#ef8a62",
        mint: "#8dc9b5",
        sand: "#f3e5cf",
      },
      boxShadow: {
        card: "0 18px 40px rgba(70, 47, 31, 0.14)",
      },
      fontFamily: {
        sans: ["'Pretendard'", "'Noto Sans KR'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
