"use client";

import type { Prayer } from "@/lib/book";

export function PrayersView({ prayers }: { prayers: Prayer[] }) {
  const before = prayers.filter((p) => p.category === "before");
  const after = prayers.filter((p) => p.category === "after");

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Prayers of St. Thomas Aquinas, O.P.</h2>
        <p className="mt-2 text-muted-foreground text-[15px] leading-relaxed max-w-2xl">
          The addenda to the volume: the Angelic Doctor&rsquo;s own prayers before and after Holy
          Communion, together with four Eucharistic hymns. The prose prayers were divided into
          single lines in the original so that they could be said aloud in unison.
        </p>
      </header>

      {([["Before Holy Communion", before], ["After Holy Communion", after]] as const).map(
        ([heading, list]) => (
          <section key={heading} className="mb-10" aria-labelledby={`pr-${heading.replace(/\s/g, "-")}`}>
            <div className="flex items-center gap-3 mb-1">
              <h3 id={`pr-${heading.replace(/\s/g, "-")}`} className="text-smallcaps text-[17px] font-medium text-primary">
                {heading}
              </h3>
            </div>
            <div aria-hidden className="rule-double mb-5" />
            <div className="space-y-6">
              {list.map((p, i) => (
                <article key={i} className="paper-card rounded-lg border px-6 py-7 sm:px-9">
                  <h4 className="text-center text-smallcaps text-[16px] font-medium text-foreground">
                    {p.title}
                  </h4>
                  <div aria-hidden className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="fleuron text-xs">❧</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <p className="whitespace-pre-line text-center text-foreground/95 text-[1.05rem] leading-[1.8]">
                    {p.lines.join("\n")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
