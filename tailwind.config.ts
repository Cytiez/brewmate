import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // semantic tokens — wired to CSS variables defined in globals.css
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
        },
        rule: {
          DEFAULT: "rgb(var(--rule) / <alpha-value>)",
          strong: "rgb(var(--rule-strong) / <alpha-value>)",
        },
        persimmon: {
          DEFAULT: "rgb(var(--persimmon) / <alpha-value>)",
          soft: "rgb(var(--persimmon-soft) / <alpha-value>)",
        },
        matcha: "rgb(var(--matcha) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        wider: "0.06em",
        widest: "0.18em",
        kissaten: "0.32em",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      maxWidth: {
        mobile: "430px",
      },
      borderWidth: {
        hairline: "0.5px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.35s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
