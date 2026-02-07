import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        "soft-green": "#6BBF8A",
        "warm-beige": "#F5F0E8",
        // Secondary
        "sunny-yellow": "#FFD966",
        "calm-blue": "#7BAFD4",
        "soft-coral": "#F4A9A8",
        // Neutral
        "dark-gray": "#333333",
        "mid-gray": "#888888",
        "light-gray": "#E8E8E8",
      },
      fontFamily: {
        pretendard: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
