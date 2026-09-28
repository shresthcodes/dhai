import React from "react";
import { ArrowRight, Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GoldRule } from "@/components/ui/GoldRule";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ComingSoonProps {
  title:       string;
  description: string;
  eyebrow?:    string;
}

export function ComingSoon({ title, description, eyebrow }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex items-center">
      <Container>
        <div className="max-w-2xl space-y-6 py-32">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <div className="w-12 h-12 rounded-card surface flex items-center justify-center">
            <Construction size={22} strokeWidth={1.5} className="text-gold/60" />
          </div>
          <h1 className="font-serif text-h1 text-ivory">{title}</h1>
          <GoldRule />
          <p className="font-sans text-body text-ivory/55 leading-relaxed">{description}</p>
          <p className="font-sans text-caption text-ivory/35 italic">
            Coming in the next build step.
          </p>
          <div className="pt-2">
            <DemoBadge />
          </div>
          <div className="pt-2">
            <Button variant="ghost" size="sm" href="/">
              <ArrowRight size={14} strokeWidth={1.5} className="rotate-180 mr-1.5" />
              Back to home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
