"use client";

import { useCallback, useMemo } from "react";
import {
  addDays, diffDays, formatDateLong, getEaster, MONTH_NAMES, nthSundayOfMonth,
  sameDay, toUTC, type MeditationMeta,
} from "@/lib/liturgical";

const WEEKDAY_HEADS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  month: number; // 1-12
  year: number;
  selected: Date;
  index: MeditationMeta[];
  onSelect: (d: Date) => void;
  onMonthChange: (year: number, month: number) => void;
}

/** Compact month grid; days carrying their own assignment are dotted. */
export function MonthCalendar({ month, year, selected, index, onSelect, onMonthChange }: Props) {
  const today = useMemo(() => toUTC(new Date()), []);

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(year, month - 1, 1));
    const startPad = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const list: (Date | null)[] = Array.from({ length: startPad }, () => null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(Date.UTC(year, month - 1, d)));
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [year, month]);

  // cache resolutions for the visible month once
  const assigned = useMemo(() => {
    const easter = getEaster(year);
    const sundays = [1, 2, 3].map((n) => nthSundayOfMonth(year, 10, n));
    const set = new Set<string>();
    for (const c of cells) {
      if (!c) continue;
      const off = diffDays(c, easter);
      if (off >= -63 && off <= 70) {
        if (index.some((m) => m.easterOffset === off)) set.add(c.toISOString().slice(0, 10));
        continue;
      }
      const sundayIdx = sundays.findIndex((s) => sameDay(s, c));
      const hasFixed = index.some(
        (m) => m.kind === "fixed" && m.month === c.getUTCMonth() + 1 && m.day === c.getUTCDate(),
      );
      const hasSunday = sundayIdx >= 0 && index.some((m) => m.octoberSunday === sundayIdx + 1);
      if (hasFixed || hasSunday) set.add(c.toISOString().slice(0, 10));
    }
    return set;
  }, [cells, index, year]);

  const shiftMonth = useCallback(
    (delta: number) => {
      const m = month - 1 + delta;
      onMonthChange(year + Math.floor(m / 12), ((m % 12) + 12) % 12 + 1);
    },
    [month, year, onMonthChange],
  );

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          ‹
        </button>
        <div className="text-sm text-smallcaps text-foreground/90">
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_HEADS.map((w) => (
          <div key={w} className="py-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">
            {w}
          </div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={`e${i}`} aria-hidden />;
          const key = c.toISOString().slice(0, 10);
          const isSelected = sameDay(c, selected);
          const isToday = sameDay(c, today);
          const has = assigned.has(key);
          return (
            <button
              key={key}
              onClick={() => onSelect(c)}
              aria-label={formatDateLong(c)}
              aria-pressed={isSelected}
              className={[
                "relative h-8 w-full rounded-md text-[13px] leading-8 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold"
                  : has
                    ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                    : "text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground",
                isToday && !isSelected ? "ring-1 ring-inset ring-primary/60 font-semibold text-foreground" : "",
              ].join(" ")}
            >
              {c.getUTCDate()}
              {has && !isSelected && (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-primary/70"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Quick jump to the principal feasts of the selected year. */
export function feastDates(year: number, index: MeditationMeta[]) {
  const easter = getEaster(year);
  const feasts: { name: string; date: Date; label: string }[] = [];
  const push = (name: string, date: Date, label: string) => feasts.push({ name, date, label });
  const easterOf = (off: number) => addDays(easter, off);

  const find = (off: number) => index.find((m) => m.easterOffset === off);
  const sept = find(-63), ash = find(-46), asc = find(39), pent = find(49), cc = find(60), sh = find(68);
  if (sept) push("Septuagesima Sunday", easterOf(-63), sept.label);
  if (ash) push("Ash Wednesday", easterOf(-46), ash.label);
  push("Easter Sunday", easter, "Easter Sunday");
  if (asc) push("Ascension Day", easterOf(39), asc.label);
  if (pent) push("Pentecost", easterOf(49), pent.label);
  if (cc) push("Corpus Christi", easterOf(60), cc.label);
  if (sh) push("Sacred Heart", easterOf(68), sh.label);
  push("Rosary Feast (1st Sunday of October)", nthSundayOfMonth(year, 10, 1), "First Sunday in October");
  push("First Sunday of Advent", firstAdvent(year), "First Sunday of Advent");
  push("Christmas", new Date(Date.UTC(year, 11, 25)), "December 25");
  return feasts;
}

function firstAdvent(year: number): Date {
  const christmas = new Date(Date.UTC(year, 11, 25));
  // Fourth Sunday before Christmas
  const pad = christmas.getUTCDay(); // 0 = Sunday
  const lastSundayBefore = addDays(christmas, -(pad === 0 ? 7 : pad));
  return addDays(lastSundayBefore, -21);
}
