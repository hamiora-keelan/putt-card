import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        accent: "var(--color-accent)"
      },
      borderRadius: {
        lg: "var(--radius-lg)"
      }
    }
  },
  plugins: []
};

export default config;
