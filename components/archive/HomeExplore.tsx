"use client";

import React from "react";
import { ScrollText, BookOpen, Mic, FileText, Scale, Camera, Archive, Volume2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { DemoBadge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import Link from "next/link";

const CATEGORIES = [
  { icon: ScrollText, title: "Writings",              desc: "Essays, articles and published works", href: "/archive?type=writing",      count: 3, featured: true },
  { icon: Mic,        title: "Speeches",              desc: "Transcripts and audio records",        href: "/archive?type=speech",       count: 2, featured: true },
  { icon: BookOpen,   title: "Books",                 desc: "Authored and edited volumes",          href: "/archive?type=writing",      count: 2, featured: false },
  { icon: FileText,   title: "Manuscripts",           desc: "Handwritten and typed drafts",         href: "/archive?type=manuscript",   count: 3, featured: false },
  { icon: Scale,      title: "Constitutional Debates",desc: "Assembly proceedings and records",     href: "/archive?type=debate",       count: 2, featured: false },
  { icon: Camera,     title: "Photographs",           desc: "Historical photographic records",      href: "/media?type=photograph",     count: 1, featured: false },
  { icon: Archive,    title: "Historical Records",    desc: "Official documents and correspondence",href: "/archive?type=record",       count: 1, featured: false },
  { icon: Volume2,    title: "Audio-Visual",          desc: "Audio and video documentation",        href: "/media",                     count: 2, featured: false },
];

export function HomeExplore() {
  const { language } = useLanguageStore();
  const tr = useTranslations(language);

  const featured = CATEGORIES.filter((c) => c.featured);
  const rest     = CATEGORIES.filter((c) => !c.featured);

  return (
    <Section id="archive">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow={tr("home.explore.eyebrow")}
            title={tr("home.explore.title")}
            subtitle="Browse eight categories of verified archival materials. Demonstration records are shown during this prototype phase."
            className="mb-14"
          />
        </ScrollReveal>

        {/* Editorial asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {/* Two large featured cards */}
          {featured.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 0.08} className="col-span-2 lg:col-span-2">
              <TiltCard className="h-full">
                <Link
                  href={cat.href}
                  className="group flex flex-col h-full min-h-[220px] p-7 surface rounded-card hover:border-gold/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-auto">
                    <div className="w-12 h-12 rounded-card bg-gold/8 border border-gold/15 flex items-center justify-center group-hover:bg-gold/18 transition-colors">
                      <cat.icon size={22} strokeWidth={1.5} className="text-gold/70" />
                    </div>
                    <DemoBadge />
                  </div>
                  <div className="mt-8 space-y-2">
                    <h3 className="font-serif text-h3 text-ivory group-hover:text-gold transition-colors">{cat.title}</h3>
                    <p className="font-sans text-caption text-ivory/45">{cat.desc}</p>
                    <p className="eyebrow text-ivory/25">{cat.count} demo records</p>
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>
          ))}

          {/* Six smaller cards */}
          {rest.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={0.15 + i * 0.06} className="col-span-1">
              <TiltCard className="h-full">
                <Link
                  href={cat.href}
                  className="group flex flex-col h-full min-h-[160px] p-5 surface rounded-card hover:border-gold/20 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-sharp bg-gold/8 border border-gold/12 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                    <cat.icon size={16} strokeWidth={1.5} className="text-gold/60" />
                  </div>
                  <h3 className="font-serif text-[1.1rem] text-ivory group-hover:text-gold transition-colors leading-snug mb-1.5">
                    {cat.title}
                  </h3>
                  <p className="font-sans text-[0.75rem] text-ivory/40 leading-snug">{cat.desc}</p>
                  <p className="eyebrow text-ivory/20 mt-auto pt-3">{cat.count} demo</p>
                </Link>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
