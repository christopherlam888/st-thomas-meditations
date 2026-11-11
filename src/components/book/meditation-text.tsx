"use client";

import { SECTIONS } from "@/data/index";
import type { Meditation } from "@/lib/book";

export function sectionName(key: string): string {
  return SECTIONS.find((s) => s.key === key)?.name ?? key;
}

function bookPage(m: Meditation): number | null {
  // Scan page (1-based) minus front-matter offset = printed page of the 1941 edition
  const p = m.page - 19;
  return p >= 1 ? p : null;
}

interface Props {
  meditation: Meditation;
  /** override the kicker (e.g. the resolved calendar date) */
  kicker?: string;
  season?: string;
  compact?: boolean;
}

export function MeditationText({ meditation: m, kicker, season, compact }: Props) {
  const partLabel = m.part === 1 ? "Part I" : "Part II";
  const bp = bookPage(m);

  return (
    <article className={compact ? "" : "paper-card rounded-lg border shadow-sm"} {...(compact ? {} : { role: "article" })}>
      <div className={compact ? "py-2" : "px-6 py-8 sm:px-10 sm:py-10"}>
        {/* kicker */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-smallcaps text-primary text-[15px] font-medium">
            {kicker ?? m.label}
          </span>
          {(season || m.section) && (
            <span className="text-[13px] text-muted-foreground">
              {season ? `· ${season}` : `· ${partLabel} — ${sectionName(m.section)}`}
            </span>
          )}
        </div>

        {/* title */}
        {m.title ? (
          <h2 className="mt-2 font-semibold leading-tight text-[clamp(1.6rem,3.5vw,2.1rem)] tracking-tight text-foreground">
            {m.title}
          </h2>
        ) : (
          <h2 className="mt-2 font-semibold leading-tight text-[clamp(1.6rem,3.5vw,2.1rem)] tracking-tight text-foreground">
            {m.label}
          </h2>
        )}

        <div aria-hidden className="mt-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="fleuron text-sm">❧</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* epigraph */}
        {m.epigraph && (
          <p className="mt-4 text-center italic text-muted-foreground text-[17px] leading-relaxed">
            {m.epigraph}
          </p>
        )}

        {/* body */}
        <div className="mt-6 space-y-5 text-foreground/95 text-[1.1rem] leading-[1.75]">
          {m.paragraphs.map((p, i) => (
            <p
              key={i}
              className={i === 0 && p.length > 120 && !/^\d/.test(p) ? "drop-cap" : undefined}
            >
              {p}
            </p>
          ))}
        </div>

        {/* provenance */}
        <div className="mt-8 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-foreground">
          <span className="text-smallcaps">
            {partLabel} — {sectionName(m.section)}
          </span>
          {bp && <span>1941 edition, page {bp}</span>}
        </div>
      </div>
    </article>
  );
}
