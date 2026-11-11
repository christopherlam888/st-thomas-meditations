"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, Heart, Info, ScrollText } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MEDITATION_INDEX } from "@/data/index";
import { sameDay as isSameDay, toUTC, type MeditationMeta } from "@/lib/liturgical";
import { useBook } from "@/lib/book";
import { MonthCalendar, feastDates } from "./month-calendar";
import { DayView } from "./day-view";
import { BrowseView } from "./browse-view";
import { RetreatsView } from "./retreats-view";
import { PrayersView } from "./prayers-view";
import { AboutView } from "./about-view";
import { GithubLink, MobileMenuButton, SiteTitle, ThemeToggle } from "./header";

type View = "day" | "browse" | "retreats" | "prayers" | "about";

const NAV: { key: View; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "day", name: "Day by Day", icon: CalendarDays },
  { key: "browse", name: "All Meditations", icon: BookOpen },
  { key: "retreats", name: "Retreat Topics", icon: ScrollText },
  { key: "prayers", name: "Prayers", icon: Heart },
  { key: "about", name: "About the Book", icon: Info },
];

export function AppShell() {
  const { data, error } = useBook();
  const [view, setView] = useState<View>("day");
  const [today, setToday] = useState<Date | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [cal, setCal] = useState<{ y: number; m: number } | null>(null);
  const [browseId, setBrowseId] = useState<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  // "Today" must be evaluated on the client only: the static export is
  // pre-rendered at build time, so a build-time date would mismatch.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const t = toUTC(new Date());
    setToday(t);
    setDate((d) => d ?? t);
    setCal((c) => c ?? { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const index = MEDITATION_INDEX;

  const meditations = useMemo(() => data?.meditations ?? [], [data]);

  const nav = (
    <nav aria-label="Sections of the book" className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => {
              setView(item.key);
              setNavOpen(false);
            }}
            aria-current={active ? "page" : undefined}
            className={[
              "w-full flex items-center gap-3 rounded-md px-3 py-2 text-[15px] transition-colors text-left",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {item.name}
          </button>
        );
      })}
    </nav>
  );

  const daySidebar = (
    <div className="space-y-6">
      {date && cal && (
        <>
          <MonthCalendar
            year={cal.y}
            month={cal.m}
            selected={date}
            index={index}
            onSelect={(d) => {
              setDate(d);
              setCal({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
              setNavOpen(false);
            }}
            onMonthChange={(y, m) => setCal({ y, m })}
          />
          <FeastJump
            year={cal.y}
            index={index}
            onPick={(d) => {
              setDate(d);
              setCal({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
              setNavOpen(false);
            }}
          />
          {today && !isSameDay(today, date) && (
            <button
              onClick={() => {
                setDate(today);
                setCal({ y: today.getUTCFullYear(), m: today.getUTCMonth() + 1 });
              }}
              className="w-full rounded-md border border-border px-3 py-2 text-[13.5px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              ← Back to today
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <span>
                  <MobileMenuButton onClick={() => setNavOpen(true)} />
                </span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto scroll-elegant p-5">
                <SheetTitle className="text-smallcaps text-base font-medium text-primary mb-1 text-left">
                  Meditations of St. Thomas Aquinas
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation for the daily meditations
                </SheetDescription>
                {nav}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    {view === "day" ? "Calendar" : "Calendar (Day by Day)"}
                  </p>
                  {daySidebar}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <SiteTitle />
          <div className="ml-auto flex items-center gap-1">
            <GithubLink />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 flex">
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 border-r border-border/70">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto scroll-elegant px-5 py-6">
            {nav}
            <div className="mt-6 pt-5 border-t border-border">{daySidebar}</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          <div className="mx-auto max-w-2xl">
            {error ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : !data ? (
              <LoadingState />
            ) : view === "day" ? (
              date ? (
                <DayView
                  date={date}
                  index={index}
                  meditations={meditations}
                  onChangeDate={(d) => {
                    setDate(d);
                    setCal({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
                  }}
                />
              ) : (
                <LoadingState />
              )
            ) : view === "browse" ? (
              <BrowseView meditations={meditations} selectedId={browseId} onSelect={setBrowseId} />
            ) : view === "retreats" ? (
              <RetreatsView retreats={data.retreats} />
            ) : view === "prayers" ? (
              <PrayersView prayers={data.prayers} />
            ) : (
              <AboutView data={data} />
            )}
          </div>
        </main>
      </div>

      <footer className="mt-auto border-t border-border/80 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[13px] text-muted-foreground">
          <p className="min-w-0">
            <span className="text-smallcaps">Meditations of St. Thomas Aquinas, O.P. — For Every Day</span>
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            Father E. C. McEniry, O.P. · College Book Company, Columbus, Ohio · 1941
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:ml-auto inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading the book">
      <div className="h-8 w-40 rounded bg-muted animate-pulse" />
      <div className="h-12 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-4 w-full rounded bg-muted/70 animate-pulse" />
      ))}
    </div>
  );
}

function FeastJump({
  year,
  index,
  onPick,
}: {
  year: number;
  index: MeditationMeta[];
  onPick: (d: Date) => void;
}) {
  const feasts = useMemo(() => feastDates(year, index), [year, index]);
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
        Feasts of {year}
      </p>
      <ul className="space-y-0.5">
        {feasts.map((f) => (
          <li key={f.name}>
            <button
              onClick={() => onPick(f.date)}
              className="w-full flex items-baseline justify-between gap-2 rounded px-2 py-1 text-[13.5px] text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span className="truncate">{f.name}</span>
              <span className="text-muted-foreground shrink-0 text-[12.5px]">
                {formatShort(f.date)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatShort(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
