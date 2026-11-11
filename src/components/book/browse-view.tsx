"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { MEDITATION_INDEX, SECTIONS } from "@/data/index";
import type { Meditation } from "@/lib/book";
import type { MeditationMeta } from "@/lib/liturgical";
import { MeditationText } from "./meditation-text";

interface Props {
  meditations: Meditation[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function BrowseView({ meditations, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const byId = useMemo(() => {
    const map = new Map<number, Meditation>();
    for (const m of meditations) map.set(m.id, m);
    return map;
  }, [meditations]);

  const selected = selectedId != null ? byId.get(selectedId) ?? null : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: MeditationMeta[] = MEDITATION_INDEX;
    if (q) {
      list = list.filter(
        (m) =>
          (m.title ?? "").toLowerCase().includes(q) ||
          m.label.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query]);

  const neighbours = useMemo(() => {
    if (selectedId == null) return null;
    const i = MEDITATION_INDEX.findIndex((m) => m.id === selectedId);
    if (i < 0) return null;
    return {
      prev: i > 0 ? MEDITATION_INDEX[i - 1] : null,
      next: i < MEDITATION_INDEX.length - 1 ? MEDITATION_INDEX[i + 1] : null,
      position: i + 1,
    };
  }, [selectedId]);

  if (selected) {
    return (
      <div>
        <button
          onClick={() => onSelect(null)}
          className="no-print inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All meditations
        </button>
        <div className="mb-4 text-[13px] text-muted-foreground">
          Meditation {neighbours?.position} of {MEDITATION_INDEX.length} in the order of the book
        </div>
        <MeditationText meditation={selected} />
        <nav className="no-print mt-8 grid grid-cols-2 gap-3" aria-label="Neighbouring meditations">
          {neighbours?.prev ? (
            <button
              onClick={() => onSelect(neighbours.prev!.id)}
              className="group rounded-lg border bg-card px-4 py-3 text-left hover:border-primary/50 transition-colors"
            >
              <span className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                <ChevronLeft className="h-3 w-3" aria-hidden /> Previous
              </span>
              <span className="block text-[15px] text-foreground/90 group-hover:text-foreground truncate">
                {neighbours.prev.title ?? neighbours.prev.label}
              </span>
            </button>
          ) : (
            <div />
          )}
          {neighbours?.next ? (
            <button
              onClick={() => onSelect(neighbours.next!.id)}
              className="group rounded-lg border bg-card px-4 py-3 text-right hover:border-primary/50 transition-colors"
            >
              <span className="flex items-center justify-end gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                Next <ChevronRight className="h-3 w-3" aria-hidden />
              </span>
              <span className="block text-[15px] text-foreground/90 group-hover:text-foreground truncate">
                {neighbours.next.title ?? neighbours.next.label}
              </span>
            </button>
          ) : (
            <div />
          )}
        </nav>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 370 meditations by title or day…"
          aria-label="Search meditations"
          className="w-full h-10 rounded-md border border-border bg-card pl-9 pr-3 text-[15px] outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="space-y-8">
        {SECTIONS.map((sec) => {
          const items = filtered.filter((m) => m.section === sec.key);
          if (items.length === 0) return null;
          return (
            <section key={sec.key} aria-labelledby={`sec-${sec.key}`}>
              <div className="flex items-baseline gap-3 mb-1">
                <h3 id={`sec-${sec.key}`} className="text-smallcaps text-[17px] font-medium text-primary">
                  {sec.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {sec.part === 1 ? "Part I — Advent to the Sacred Heart" : "Part II — July to Advent"}
                </span>
              </div>
              <div aria-hidden className="rule-double mb-3" />
              <ul className="grid gap-1">
                {items.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => onSelect(m.id)}
                      className="w-full text-left rounded-md px-3 py-2 hover:bg-accent/70 transition-colors"
                    >
                      <span className="block text-[13px] text-muted-foreground text-smallcaps">{m.label}</span>
                      <span className="block text-[15px] text-foreground/90 leading-snug">
                        {m.title ?? m.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nothing matches “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
