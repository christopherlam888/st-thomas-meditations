/**
 * Liturgical calendar helpers for the traditional (1962) Roman calendar,
 * as used by "Meditations of St. Thomas Aquinas, O.P. for Every Day".
 *
 * The book assigns meditations three ways:
 *  - fixed calendar dates (Nov 27 – Feb 20 and Jul 1 – Nov 26)
 *  - movable days reckoned from Easter (Septuagesima … Sunday after the
 *    Octave of Corpus Christi), each stored as an offset in days from Easter
 *  - the first / second / third Sunday of October (Rosary, Maternity, Purity)
 *
 * Easter is computed with the Gregorian computus (the same dates the 1962
 * Missal follows, since 1583 the Western church has used the Gregorian Easter).
 */

export const DAY_MS = 86_400_000;

/** Gregorian Easter Sunday (Meeus/Jones/Butcher algorithm). */
export function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export function toUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
}

/** n-th Sunday of a given month (1-indexed), in UTC. */
export function nthSundayOfMonth(year: number, month: number, n: number): Date {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (7 - first.getUTCDay()) % 7; // days until first Sunday
  return addDays(first, offset + (n - 1) * 7);
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatDateLong(d: Date): string {
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatDateShort(d: Date): string {
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function dateKey(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${m}-${day}`;
}

/** Movable season bounds in days from Easter (per the book's arrangement). */
export const MOVABLE_FIRST = -63; // Septuagesima Sunday
export const MOVABLE_LAST = 70;   // Sunday after the Octave of Corpus Christi

export interface MeditationMeta {
  id: number;
  part: 1 | 2;
  section: string;
  kind: "fixed" | "movable" | "sunday" | "topic";
  label: string;
  title: string | null;
  month: number | null;
  day: number | null;
  easterOffset: number | null;
  octoberSunday: number | null;
}

export interface DayResolution {
  date: Date;
  /** headline label for the day, e.g. "Thursday after Ash Wednesday" or "December 1" */
  label: string;
  meditations: MeditationMeta[];
  /** true when the book itself assigns these meditations to this exact day */
  exact: boolean;
  /** present when nothing is assigned and a nearby day is shown instead */
  note?: string;
  /** liturgical season key, when the day falls in the movable season */
  season?: string;
}

function seasonForOffset(offset: number): string {
  if (offset <= -47) return "Septuagesima";
  if (offset <= -1) return "Lent"; // from Ash Wednesday (−46) onward
  if (offset < 39) return "Paschal Time";
  if (offset <= 48) return "Ascension Tide";
  if (offset === 49) return "Pentecost";
  if (offset <= 55) return "Whitsun Week";
  if (offset <= 59) return "Octave of Trinity";
  if (offset <= 67) return "Octave of Corpus Christi";
  return "Sacred Heart";
}

interface ResolveResult {
  label: string;
  meditations: MeditationMeta[];
  season?: string;
}

function resolveExact(date: Date, index: MeditationMeta[]): ResolveResult | null {
  const easter = getEaster(date.getUTCFullYear());
  const offset = diffDays(date, easter);

  // 1. Movable season (Septuagesima … Sunday after the Corpus Christi octave)
  if (offset >= MOVABLE_FIRST && offset <= MOVABLE_LAST) {
    const exact = index.filter((m) => m.easterOffset === offset);
    if (exact.length > 0) {
      return { label: exact[0].label, meditations: exact, season: seasonForOffset(offset) };
    }
    // The book leaves five days of the movable season unassigned
    // (the Thu/Fri after the Easter octave, Tue/Wed of the second week after
    // Easter, and the Saturday before Trinity). Show the nearest earlier day.
    for (let o = offset - 1; o >= MOVABLE_FIRST; o--) {
      const prev = index.filter((m) => m.easterOffset === o);
      if (prev.length > 0) {
        return { label: prev[0].label, meditations: prev, season: seasonForOffset(o) };
      }
    }
  }

  // 2. October Sundays (Rosary, Maternity, Purity) — shown alongside the
  //    fixed date meditation of the same day.
  const year = date.getUTCFullYear();
  const sundays = [1, 2, 3].map((n) => nthSundayOfMonth(year, 10, n));
  const sundayIdx = sundays.findIndex((s) => sameDay(s, date));
  const sundayMeds = sundayIdx >= 0 ? index.filter((m) => m.octoberSunday === sundayIdx + 1) : [];

  // 3. Fixed calendar dates
  const fixed = index.filter(
    (m) => m.kind === "fixed" && m.month === date.getUTCMonth() + 1 && m.day === date.getUTCDate(),
  );

  if (sundayMeds.length > 0 || fixed.length > 0) {
    const meds = [...sundayMeds, ...fixed];
    const label = sundayMeds.length > 0 ? sundayMeds[0].label : `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}`;
    return { label, meditations: meds };
  }

  return null;
}

/**
 * Resolve which meditation(s) the book assigns to a given calendar date for
 * the liturgical year that date belongs to. Days the book leaves unassigned
 * (e.g. the tail of June in years with an early Easter) fall back to the
 * nearest previous day and are flagged with a note.
 */
export function resolveDate(date: Date, index: MeditationMeta[]): DayResolution {
  const d = toUTC(date);
  const direct = resolveExact(d, index);
  if (direct) {
    return { date: d, label: direct.label, meditations: direct.meditations, exact: true, season: direct.season };
  }
  for (let i = 1; i <= 45; i++) {
    const prev = addDays(d, -i);
    const r = resolveExact(prev, index);
    if (r) {
      return {
        date: d,
        label: r.label,
        meditations: r.meditations,
        exact: false,
        season: r.season,
        note: `The book assigns no meditation to this particular day. Shown here is the meditation for ${r.label} (${formatDateShort(prev)}).`,
      };
    }
  }
  return { date: d, label: MONTH_NAMES[d.getUTCMonth()] + " " + d.getUTCDate(), meditations: [], exact: false };
}

/** Next/previous calendar date that has its own assignment (for day stepping). */
export function stepDay(date: Date, index: MeditationMeta[], dir: 1 | -1): Date {
  let d = addDays(toUTC(date), dir);
  for (let i = 0; i < 80; i++) {
    if (resolveExact(d, index)) return d;
    d = addDays(d, dir);
  }
  return toUTC(date);
}
