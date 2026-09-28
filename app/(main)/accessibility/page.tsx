import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { Button } from "@/components/ui/Button";
import {
  ZoomIn, Sun, Wind, Volume2, Type, Underline, Focus,
  CheckCircle, AlertCircle, Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility — DHAI",
  description: "Accessibility features implemented in DHAI. Honest description of what works and known limitations.",
};

const FEATURES = [
  { icon: ZoomIn,     title: "Text Size",          desc: "Font size adjustable to 100%, 115%, 130% or 150%. All layouts tested at 150% — some wrapping may occur on very narrow viewports." },
  { icon: Sun,        title: "High Contrast",       desc: "Alternate token set with stronger text/border contrast. 3D scenes switch to a 2D fallback." },
  { icon: Wind,       title: "Reduce Motion",       desc: "Disables parallax, camera dolly, auto-drift, Guided mode and autoplay previews. Defaults to ON if the OS requests it." },
  { icon: Volume2,    title: "Narration",           desc: "Listen controls use the browser's Web Speech API. Voice availability depends on the device. Only languages with a confirmed voice are offered." },
  { icon: Type,       title: "Readable Font",       desc: "Switches to a high-legibility sans-serif with increased line-height and letter-spacing." },
  { icon: Underline,  title: "Underline Links",     desc: "All links gain a visible underline when this is enabled." },
  { icon: Focus,      title: "Strong Focus Rings",  desc: "Gold focus rings are visible by default. This option makes them thicker and higher-contrast." },
];

const LIMITATIONS = [
  "3D scenes (Home hero, Timeline, Story Mode, Media Wall, Ask Knowledge Map) provide a fully usable 2D fallback under Reduce Motion or on low-performance devices, but the 3D scenes themselves are not screen-reader accessible.",
  "UI translations (Hindi and Gujarati) are prototype quality and pending native review. Historical content is not machine-translated — it remains in English with a notice.",
  "Text-to-speech narration depends entirely on voices installed on the user's device. Hindi and Gujarati voices may not be available on all systems.",
  "Colour contrast has been designed against the palette but no formal automated compliance audit has been completed. Some decorative elements may not meet WCAG ratios.",
  "Drag-and-drop reordering in My Collection has a keyboard alternative (Move up / Move down buttons) but the drag gesture itself does not support assistive technologies.",
  "OCR Lab in the Document Viewer involves canvas-based operations that are not directly screen-reader accessible; the extracted text is always available in the Read tab.",
  "This is a prototype. No accessibility certification or compliance badge is claimed.",
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen pt-[4.5rem]">
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-10">
          <div className="space-y-3">
            <p className="eyebrow text-gold/70">Accessibility</p>
            <h1 className="font-serif text-h1 text-ivory">Accessibility Features</h1>
            <GoldRule />
            <p className="font-sans text-body text-ivory/50 max-w-2xl">
              An honest description of the accessibility features implemented in this prototype,
              known limitations, and how to report issues.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-10 space-y-12">
        {/* Implemented features */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="font-serif text-h2 text-ivory mb-6">What is implemented</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="surface rounded-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sharp bg-gold/8 border border-gold/15 flex items-center justify-center">
                    <Icon size={14} strokeWidth={1.5} className="text-gold/60" />
                  </div>
                  <h3 className="font-sans text-sm font-semibold text-ivory">{title}</h3>
                  <CheckCircle size={12} strokeWidth={1.5} className="text-gold/50 ml-auto" />
                </div>
                <p className="font-sans text-caption text-ivory/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Keyboard + navigation */}
          <div className="mt-6 surface rounded-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-sm font-semibold text-ivory">Keyboard & Navigation</h3>
              <CheckCircle size={12} strokeWidth={1.5} className="text-gold/50 ml-auto" />
            </div>
            <ul className="space-y-1.5 font-sans text-caption text-ivory/50">
              {[
                "Skip-to-content link on first Tab press",
                "All interactive elements reachable by keyboard with visible gold focus rings",
                "Logical tab order on all pages; no keyboard traps",
                "Esc closes dialogs and returns focus to the trigger",
                "Press ? anywhere to see a keyboard shortcuts cheat-sheet",
                "Alt+A opens the Accessibility Panel",
                "Player: Space/J/K/L/F/M shortcuts; Timeline: 1–5 / Arrow keys; Story: 1–5 / Arrow keys",
                "Landmark roles: header, nav, main, footer, complementary",
                "One h1 per page; proper heading hierarchy",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold/30 shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <GoldRule width="full" />

        {/* Known limitations */}
        <section aria-labelledby="limits-heading">
          <h2 id="limits-heading" className="font-serif text-h2 text-ivory mb-4">Known limitations</h2>
          <div className="space-y-3">
            {LIMITATIONS.map((lim, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 rounded-card border border-[rgba(244,237,224,0.08)] bg-[rgba(244,237,224,0.02)]">
                <AlertCircle size={13} strokeWidth={1.5} className="text-terracotta/50 shrink-0 mt-0.5" />
                <p className="font-sans text-caption text-ivory/50 leading-relaxed">{lim}</p>
              </div>
            ))}
          </div>
        </section>

        <GoldRule width="full" />

        {/* Feedback */}
        <section aria-labelledby="feedback-heading">
          <h2 id="feedback-heading" className="font-serif text-h2 text-ivory mb-4">Feedback</h2>
          <div className="flex items-start gap-3 px-4 py-4 rounded-card border border-azure/20 bg-azure/4">
            <Info size={14} strokeWidth={1.5} className="text-azure/60 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-sans text-caption text-ivory/55">
                This is a prototype built for Smart India Hackathon 2026. If you encounter
                an accessibility barrier, please note the page and the task you were trying to complete.
              </p>
              <p className="font-sans text-caption text-ivory/35 italic">
                Feedback contact — placeholder for institutional deployment.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Button variant="ghost" size="sm" href="/collection">My Collection</Button>
            <Button variant="ghost" size="sm" href="/">Home</Button>
          </div>
        </section>

        {/* Demo badge */}
        <div className="pt-4">
          <DemoBadge />
          <p className="font-sans text-[0.65rem] text-ivory/25 mt-2 italic">
            Prototype. No compliance certification claimed.
          </p>
        </div>
      </Container>
    </div>
  );
}
