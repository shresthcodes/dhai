import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:        "#0B0D12",
        night:      "#10141C",
        panel:      "#161B26",
        ivory:      "#F4EDE0",
        parchment:  "#E8DCC3",
        gold:       "#C9A24B",
        "gold-soft":"#E3C77A",
        azure:      "#4C7FB8",
        terracotta: "#B5573A",
        line:       "rgba(244,237,224,0.12)",
      },
      fontFamily: {
        serif:  ["var(--font-cormorant)", "Georgia", "serif"],
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(3rem, 7vw, 6rem)",   { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1:      ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.1",  letterSpacing: "-0.015em" }],
        h2:      ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h3:      ["clamp(1.25rem, 2.5vw, 2rem)", { lineHeight: "1.25", letterSpacing: "-0.005em" }],
        body:    ["1rem",   { lineHeight: "1.7" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],
        eyebrow: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.15em" }],
      },
      borderRadius: {
        card:    "16px",
        cardSm:  "12px",
        sharp:   "6px",
      },
      boxShadow: {
        card:    "0 4px 32px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
        glow:    "0 0 24px rgba(201,162,75,0.18)",
        inner:   "inset 0 1px 0 rgba(244,237,224,0.08)",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        "gold-gradient": "linear-gradient(135deg, #C9A24B 0%, #E3C77A 50%, #C9A24B 100%)",
        "surface-gradient": "linear-gradient(180deg, #10141C 0%, #0B0D12 100%)",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "shimmer":    "shimmer 2.5s linear infinite",
        "dust-drift": "dustDrift 8s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeUp:  { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        dustDrift: {
          from: { transform: "translateY(0px) translateX(0px)" },
          to:   { transform: "translateY(-12px) translateX(6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
