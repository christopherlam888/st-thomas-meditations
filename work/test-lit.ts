import { getEaster, resolveDate, stepDay } from "../src/lib/liturgical";
import { MEDITATION_INDEX as IDX } from "../src/data/index";

const known: [number, string][] = [
  [2024, "2024-03-31"], [2025, "2025-04-20"], [2026, "2026-04-05"],
  [2027, "2027-03-28"], [1940, "1940-03-24"], [2038, "2038-04-25"], [2011, "2011-04-24"],
];
for (const [y, exp] of known) {
  const e = getEaster(y);
  const got = `${e.getUTCFullYear()}-${String(e.getUTCMonth()+1).padStart(2,"0")}-${String(e.getUTCDate()).padStart(2,"0")}`;
  console.log(`Easter ${y}: ${got} ${got === exp ? "OK" : "FAIL (expected " + exp + ")"}`);
}

function d(s: string) { const [y,m,dd] = s.split("-").map(Number); return new Date(Date.UTC(y, m-1, dd)); }

// Today-ish checks
const tests = [
  ["2025-11-30", "First Sunday of Advent ish — Nov 30 fixed"],
  ["2025-12-11", "Dec 11 — should show 3 meditations"],
  ["2025-06-22", "June 22 2025 — Corpus Christi octave (Easter Apr 20)"],
  ["2026-06-20", "June 20 2026 — after window (Easter Apr 5, window ends Jun 14) → fallback note"],
  ["2026-03-04", "Ash Wednesday 2026 (Easter Apr 5 → Feb 18?? check)"],
  ["2025-10-05", "First Sunday of October 2025 — Rosary + Oct 5"],
  ["2026-02-17", "Ash Wednesday 2026"],
  ["2025-04-20", "Easter Sunday 2025"],
  ["2025-04-10", "offset +11 gap day → fallback"],
];
for (const [s, note] of tests) {
  const r = resolveDate(d(s), IDX);
  console.log(`${s} [${note}]\n   -> label="${r.label}" exact=${r.exact} season=${r.season ?? "—"} meds=[${r.meditations.map(m => m.title ?? m.label).join(" | ")}]${r.note ? "\n   note: " + r.note : ""}`);
}
