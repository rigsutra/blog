import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1a1a1a",
            a: {
              color: "#2563eb",
              "&:hover": { color: "#1d4ed8" },
            },
            "h1, h2, h3, h4": {
              fontWeight: "700",
              letterSpacing: "-0.02em",
            },
            blockquote: {
              borderLeftColor: "#e5e7eb",
              fontStyle: "italic",
            },
            code: {
              backgroundColor: "#f3f4f6",
              borderRadius: "0.25rem",
              padding: "0.125rem 0.375rem",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
            },
          },
        },
        invert: {
          css: {
            color: "#e2e8f0",
            a: {
              color: "#60a5fa",
              "&:hover": { color: "#93c5fd" },
            },
            "h1, h2, h3, h4": { color: "#f1f5f9" },
            blockquote: { borderLeftColor: "#334155", color: "#94a3b8" },
            code: { backgroundColor: "#1e293b", color: "#e2e8f0" },
            hr: { borderColor: "#334155" },
            strong: { color: "#f1f5f9" },
          },
        },
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
