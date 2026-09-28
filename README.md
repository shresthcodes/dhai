# DHAI — Digital Heritage Archive & Intelligence

**Prototype for Smart India Hackathon 2026.**  
A national digital museum, scholarly archive and AI research platform.  
All content shown is placeholder demonstration data only.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Build & Type Check

```bash
npm run build        # production build
npm run type-check   # TypeScript check without emitting
npm run lint         # ESLint
```

---

## Folder Map

```
dhai/
├── app/
│   ├── layout.tsx              Root layout (fonts, metadata)
│   ├── (main)/                 Route group with Navbar + Footer
│   │   ├── layout.tsx          Main layout (Lenis, A11y applier)
│   │   ├── page.tsx            Home page
│   │   ├── archive/
│   │   ├── search/
│   │   ├── document/[id]/
│   │   ├── ask/
│   │   ├── media/
│   │   ├── media/[id]/
│   │   ├── timeline/
│   │   ├── story/
│   │   ├── collection/
│   │   ├── admin/
│   │   └── lab/                3D engine verification route
│   └── (kiosk)/                Route group WITHOUT navbar/footer
│       ├── layout.tsx
│       ├── kiosk/
│       └── display/
│
├── components/
│   ├── ui/                     Reusable design system components
│   │   ├── Button.tsx          Primary / secondary / ghost + magnetic hover
│   │   ├── TiltCard.tsx        3D perspective tilt with moving highlight
│   │   ├── Badge.tsx           + DemoBadge (on all mock content)
│   │   ├── Container.tsx
│   │   ├── SectionHeading.tsx  Eyebrow + serif title + gold rule
│   │   ├── GoldRule.tsx        + Divider
│   │   ├── Tooltip.tsx         + Kbd
│   │   ├── PageTransition.tsx  Fade + rise wrapper
│   │   └── ComingSoon.tsx      Designed empty-state
│   ├── layout/
│   │   ├── Navbar.tsx          Sticky, scroll-aware, mobile menu, a11y panel
│   │   ├── Footer.tsx          Institutional style, 3-column
│   │   ├── AccessibilityPanel.tsx  Text scale, high contrast, reduce motion
│   │   ├── A11yApplier.tsx     Syncs store → data-* on <html>
│   │   └── LenisProvider.tsx   Smooth scroll (auto-disabled on prefers-reduced-motion)
│   ├── three/
│   │   ├── SceneCanvas.tsx     Canvas wrapper, Suspense, ACES tone mapping
│   │   ├── MuseumLighting.tsx  Warm key + cool rim + soft ambient
│   │   ├── DustParticles.tsx   Floating motes in light
│   │   ├── PostFX.tsx          Bloom + vignette + DoF (tier-aware)
│   │   └── ParchmentPlane.tsx  Demo floating plane for /lab
│   └── archive/                (empty — next step)
│
├── data/
│   ├── models.ts               TypeScript interfaces (ArchiveItem, TimelineEvent…)
│   ├── archive.ts              Mock records + async service functions
│   ├── timeline.ts
│   └── media.ts
│
├── lib/
│   ├── utils.ts                cn() helper (clsx + tailwind-merge)
│   ├── i18n.ts                 Typed dictionary (EN / हिन्दी / ગુજરાતી)
│   ├── lenis.tsx               useLenis hook
│   └── performance.ts          usePerformanceTier() → 'high' | 'low' | 'none'
│
├── store/
│   ├── language.ts             Zustand — language selection
│   ├── accessibility.ts        Zustand — text scale, contrast, motion, narration
│   └── collection.ts           Zustand — saved archive items
│
├── styles/
│   └── globals.css             CSS variables, base reset, paper texture overlay
│
├── tailwind.config.ts          Full design token system
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Design System

| Token        | Value      | Role                        |
|--------------|------------|-----------------------------|
| `ink`        | `#0B0D12`  | Near-black page background  |
| `night`      | `#10141C`  | Surface / navbar            |
| `panel`      | `#161B26`  | Card surface                |
| `ivory`      | `#F4EDE0`  | Primary text                |
| `parchment`  | `#E8DCC3`  | Warm surface tint           |
| `gold`       | `#C9A24B`  | Primary accent              |
| `gold-soft`  | `#E3C77A`  | Hover / highlight           |
| `azure`      | `#4C7FB8`  | Secondary / tech accent     |
| `terracotta` | `#B5573A`  | Heritage accent (sparingly) |

Fonts: **Cormorant Garamond** (headings) + **Inter** (body/UI)  
Both loaded via `next/font` with `display: swap`.

---

## What to Verify in the Browser

1. **Navbar** — transparent on load → blurred dark bar on scroll.  
   Mobile: hamburger opens full-screen menu.  
2. **Language switch** — EN / हिन्दी / ગુજ — navbar text changes immediately.  
3. **Accessibility icon** → panel opens with text scale, high contrast, reduce motion toggles.  
   Toggling high contrast changes CSS variables on `<html>`.  
4. **Home page** — hero, 6 TiltCard feature cards (hover for 3D tilt + moving highlight).  
5. **/lab** — floating parchment plane, museum lighting, dust particles visible.  
   Rotating the scene with mouse drag works.  
   Bottom-right shows detected GPU tier.  
6. **/kiosk** and **/display** — NO navbar or footer.  
7. All other routes — elegant "coming soon" empty-state with Demo badge.  
8. **Focus rings** — tab through the page, gold outlines visible on all interactive elements.  
9. **Smooth scroll** — Lenis active on desktop (auto-disabled if prefers-reduced-motion is set in OS).

---

## Data Policy

Every mock record carries `isDemo: true` and renders with a `DemoBadge`.  
No historical dates, quotations, citations, statistics or institutional claims are included.  
Verified content will be supplied separately before any public deployment.

---

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** — full custom design token system
- **Framer Motion** — page transitions, TiltCard, magnetic buttons, panels
- **Three.js** + **@react-three/fiber** + **@react-three/drei** + **@react-three/postprocessing**
- **Lenis** — smooth scroll
- **Zustand** — language, accessibility, collection state
- **lucide-react** — icons (1.5px stroke weight)
- **next/font** — Cormorant Garamond + Inter, zero layout shift
