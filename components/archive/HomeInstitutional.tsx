"use client";

import React from "react";
import { ScanLine, ShieldCheck, HardDrive } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/GoldRule";

const ADMIN_CARDS = [
  {
    icon: ScanLine,
    title: "OCR & Digitisation Review",
    desc: "Human-in-the-loop review of optical character recognition output before any document enters the live archive.",
  },
  {
    icon: ShieldCheck,
    title: "Metadata Verification",
    desc: "Every record receives verified provenance, source citation and classification before publication.",
  },
  {
    icon: HardDrive,
    title: "Digital Preservation",
    desc: "Archival-grade storage with redundancy, format migration planning and long-term access guarantees.",
  },
];

export function HomeInstitutional() {
  return (
    <>
      <Section>
        <Container>
          <ScrollReveal>
            <SectionHeading
              eyebrow="Institution"
              title="Archival Integrity at Scale"
              subtitle="The platform is designed for institutional stewardship — curators, researchers and archivists manage the knowledge layer that powers every public interface."
              className="mb-12"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ADMIN_CARDS.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.1}>
                <TiltCard className="h-full">
                  <div className="surface rounded-card p-6 h-full space-y-4">
                    <div className="w-10 h-10 rounded-sharp bg-azure/8 border border-azure/15 flex items-center justify-center">
                      <card.icon size={18} strokeWidth={1.5} className="text-azure/70" />
                    </div>
                    <h3 className="font-sans text-[0.9375rem] font-semibold text-ivory">{card.title}</h3>
                    <p className="font-sans text-caption text-ivory/45 leading-relaxed">{card.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.25} className="mt-8">
            <Button variant="ghost" size="sm" href="/admin">Archive Administration →</Button>
          </ScrollReveal>
        </Container>
      </Section>

      <Divider />

      {/* Cinematic closing CTA */}
      <section className="py-28 relative overflow-hidden" aria-labelledby="closing-cta">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,75,0.06) 0%, transparent 70%)",
          }}
        />
        <Container>
          <div className="text-center space-y-7 max-w-2xl mx-auto">
            <ScrollReveal>
              <p className="eyebrow text-gold/60">DHAI</p>
              <h2
                id="closing-cta"
                className="font-serif text-display text-ivory mt-3"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                From archive to intelligence.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="font-sans text-body text-ivory/45">
                Explore the complete collection. Every document. Every speech. Every idea.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <Button variant="primary" size="lg" href="/archive">Explore the Archive</Button>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </>
  );
}
