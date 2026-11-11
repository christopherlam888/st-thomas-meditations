"use client";

import { useMemo } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addDays, formatDateLong, resolveDate, stepDay, dateKey, type MeditationMeta,
} from "@/lib/liturgical";
import type { Meditation } from "@/lib/book";
import { MeditationText } from "./meditation-text";

interface Props {
  date: Date;
  index: MeditationMeta[];
  meditations: Meditation[];
  onChangeDate: (d: Date) => void;
}

function toDateInput(d: Date): string {
  return dateKey(d);
}

function fromTodayOffset(days: number): Date {
  const now = new Date();
  const base = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return addDays(base, days);
}

export function DayView({ date, index, meditations, onChangeDate }: Props) {
  const resolution = useMemo(() => resolveDate(date, index), [date, index]);
  const prev = useMemo(() => stepDay(date, index, -1), [date, index]);
  const next = useMemo(() => stepDay(date, index, 1), [date, index]);

  const byId = useMemo(() => {
    const map = new Map<number, Meditation>();
    for (const m of meditations) map.set(m.id, m);
    return map;
  }, [meditations]);

  const full = resolution.meditations.map((meta) => byId.get(meta.id)).filter((m): m is Meditation => Boolean(m));
  const today = fromTodayOffset(0);
  const isToday = dateKey(date) === dateKey(today);

  return (
    <div>
      {/* Date controls */}
      <div className="no-print flex flex-wrap items-center gap-2 mb-6">
        <Button
          variant={isToday ? "default" : "outline"}
          size="sm"
          onClick={() => onChangeDate(today)}
          className="gap-1.5"
        >
          <CalendarCheck className="h-4 w-4" aria-hidden />
          Today
        </Button>
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          <button
            aria-label="Previous day with a meditation"
            onClick={() => onChangeDate(prev)}
            className="h-9 w-9 inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            aria-label="Choose a date"
            value={toDateInput(date)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              if (y && m && d) onChangeDate(new Date(Date.UTC(y, m - 1, d)));
            }}
            className="h-9 bg-transparent px-2 text-sm text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
          <button
            aria-label="Next day with a meditation"
            onClick={() => onChangeDate(next)}
            className="h-9 w-9 inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="ml-auto text-sm text-muted-foreground hidden sm:block">
          {formatDateLong(date)}
        </div>
      </div>

      {/* Fallback note */}
      {resolution.note && (
        <div
          role="note"
          className="mb-6 rounded-md border border-gold/40 bg-gold-soft/40 px-4 py-3 text-[15px] text-muted-foreground"
        >
          {resolution.note}
        </div>
      )}

      {/* Meditation(s) for this day */}
      {full.length === 0 ? (
        <div className="paper-card rounded-lg border p-10 text-center text-muted-foreground">
          No meditation could be resolved for this date.
        </div>
      ) : (
        <div className="space-y-6">
          {full.map((m, i) => (
            <MeditationText
              key={m.id}
              meditation={m}
              kicker={m.label}
              season={resolution.season}
              compact={false}
            />
          ))}
        </div>
      )}

      {/* Step navigation */}
      <nav className="no-print mt-8 grid grid-cols-2 gap-3" aria-label="Neighbouring days">
        <button
          onClick={() => onChangeDate(prev)}
          className="group rounded-lg border bg-card px-4 py-3 text-left hover:border-primary/50 transition-colors"
        >
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">Previous</span>
          <span className="block text-[15px] text-foreground/90 group-hover:text-foreground truncate">
            {resolveLabel(prev, index)}
          </span>
        </button>
        <button
          onClick={() => onChangeDate(next)}
          className="group rounded-lg border bg-card px-4 py-3 text-right hover:border-primary/50 transition-colors"
        >
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">Next</span>
          <span className="block text-[15px] text-foreground/90 group-hover:text-foreground truncate">
            {resolveLabel(next, index)}
          </span>
        </button>
      </nav>
    </div>
  );
}

function resolveLabel(d: Date, index: MeditationMeta[]): string {
  const r = resolveDate(d, index);
  // fixed-date labels already read as a date — don't repeat it
  if (/^[A-Z][a-z]+ \d+$/.test(r.label)) return r.label;
  return `${r.label} · ${formatShort(d)}`;
}

function formatShort(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
