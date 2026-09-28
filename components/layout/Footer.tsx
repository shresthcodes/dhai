import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { GoldRule, Divider } from "@/components/ui/GoldRule";

const ARCHIVE_LINKS = [
  { label: "Writings",    href: "/archive?type=writing" },
  { label: "Speeches",    href: "/archive?type=speech" },
  { label: "Photographs", href: "/media?type=photograph" },
  { label: "Manuscripts", href: "/archive?type=manuscript" },
  { label: "Debates",     href: "/archive?type=debate" },
];

const EXPERIENCE_LINKS = [
  { label: "Timeline",          href: "/timeline" },
  { label: "Media Gallery",     href: "/media" },
  { label: "Interactive Story", href: "/story" },
  { label: "Kiosk Display",     href: "/kiosk" },
  { label: "Ask the Archive",   href: "/ask" },
];

const INSTITUTION_LINKS = [
  { label: "About DHAI",         href: "#about" },
  { label: "Research Access",    href: "#research" },
  { label: "Contribute",         href: "#contribute" },
  { label: "Institutional Portal", href: "/admin/login" },
];

function FooterLinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-2.5" role="list">
      {links.map(({ label, href }) => (
        <li key={label}>
          <Link
            href={href}
            className="font-sans text-[0.8125rem] text-ivory/50 hover:text-gold transition-colors duration-200 focus-visible:outline-gold focus-visible:rounded-sharp"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-night border-t border-[rgba(244,237,224,0.08)]">
      <Container>
        {/* Main grid */}
        <div className="pt-16 pb-10 grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div>
              <p className="font-serif text-[1.5rem] font-semibold text-ivory leading-none">DHAI</p>
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory/35 mt-1">
                Digital Heritage Archive & Intelligence
              </p>
            </div>
            <GoldRule width="sm" />
            <p className="font-sans text-caption text-ivory/40 max-w-xs leading-relaxed">
              A national digital museum, scholarly archive and AI research platform.
            </p>
          </div>

          {/* Archive */}
          <div className="space-y-4">
            <h3 className="eyebrow text-ivory/50">Archive</h3>
            <FooterLinkList links={ARCHIVE_LINKS} />
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h3 className="eyebrow text-ivory/50">Experience</h3>
            <FooterLinkList links={EXPERIENCE_LINKS} />
          </div>

          {/* Institution */}
          <div className="space-y-4">
            <h3 className="eyebrow text-ivory/50">Institution</h3>
            <FooterLinkList links={INSTITUTION_LINKS} />
          </div>
        </div>

        <Divider />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-sans text-[0.75rem] text-ivory/30 leading-relaxed">
            Prototype built for Smart India Hackathon 2026.{" "}
            <span className="text-ivory/20">Demonstration data only.</span>
          </p>
          <p className="font-sans text-[0.7rem] text-ivory/20 tracking-wide uppercase">
            All archival content will be verified before publication.
          </p>
        </div>
      </Container>
    </footer>
  );
}
