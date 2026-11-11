"use client";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import type { Retreat } from "@/lib/book";

export function RetreatsView({ retreats }: { retreats: Retreat[] }) {
  return (
    <div>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Spiritual Topics for Retreats</h2>
        <p className="mt-2 text-muted-foreground text-[15px] leading-relaxed max-w-2xl">
          Seventeen subjects translated from various works of the Angelic Doctor — material for
          retreats and missions, appended to the meditations in the original volume.
        </p>
      </header>
      <Accordion type="single" collapsible className="space-y-3">
        {retreats.map((r, i) => (
          <AccordionItem
            key={i}
            value={`t${i}`}
            className="paper-card rounded-lg border px-6 data-[state=open]:shadow-sm"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex items-baseline gap-3 text-left">
                <span aria-hidden className="text-smallcaps text-primary text-sm">{romanize(i + 1)}</span>
                <span className="text-[17px] font-medium leading-snug">{r.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              {r.epigraph && (
                <p className="mb-4 text-center italic text-muted-foreground">{r.epigraph}</p>
              )}
              <div className="space-y-4 text-foreground/95 text-[1.05rem] leading-[1.75]">
                {r.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function romanize(n: number): string {
  const table: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of table) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}
