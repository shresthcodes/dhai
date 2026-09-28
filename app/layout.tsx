import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "@/styles/globals.css";

const cormorant = Cormorant_Garamond({
  subsets:  ["latin"],
  variable: "--font-cormorant",
  weight:   ["300", "400", "500", "600", "700"],
  style:    ["normal", "italic"],
  display:  "swap",
});

const inter = Inter({
  subsets:  ["latin", "latin-ext"],
  variable: "--font-inter",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DHAI — Digital Heritage Archive & Intelligence",
    template: "%s | DHAI",
  },
  description:
    "A national digital museum, scholarly archive and AI research platform. " +
    "Prototype built for Smart India Hackathon 2026. Demonstration data only.",
  keywords: ["digital heritage", "archive", "AI research", "scholarship", "SIH 2026"],
  robots: { index: false, follow: false }, // prototype — do not index
};

export const viewport: Viewport = {
  themeColor: "#0B0D12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      data-high-contrast="false"
      data-reduce-motion="false"
    >
      <body>
        {children}
      </body>
    </html>
  );
}
