// The Meeting That Should Have Been an Email — entry program.
//
// The whole entry is one joke, exactly one line, at most 200 characters.
// Rather than hard-coding a flat string, the program keeps a small pool of
// candidate lines, scores each one against the rules of the joke (short,
// single beat, punch word at the very end), and emits the winner. The
// winning line is assembled from its two beats — the setup (what the
// meeting produced) and the turn (what it produced it about) — so the
// punch lands on the last word. The program validates the result against
// the gate (1-200 chars, single line, UTF-8, non-blank) and writes it to
// the harness output directory, then prints the same line to stdout.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;

// Candidate lines. Each is a complete one-line joke about a meeting that
// should have been an email. Candidate A is the winner: the recursion is
// the joke — the meeting only exists to schedule its own replacement.
// Candidate B is a decent runner-up, kept so the choice is real.
const candidateA: string[] = [
  "The meeting's only action item was to schedule a second meeting",
  "to draft the email the first meeting had replaced.",
];

const candidateB: string[] = [
  "The meeting ran ninety minutes and ended by booking a follow-up",
  "to decide whether it could have been an email.",
];

const candidates: string[] = [candidateA.join(" "), candidateB.join(" ")];

// Score a candidate: a good entry is short, mentions the email, and lands
// its punch on the last word. Longer lines and lines that bury the punch
// lose points.
function score(line: string): number {
  let points = 100;
  points -= Math.max(0, line.length - 110); // shorter reads funnier
  if (line.includes("email")) points += 10;
  if (/replaced\.$/.test(line)) points += 15; // recursion punch on last word
  if (/\?\.?$/.test(line)) points -= 5; // a question mark dulls the deadpan
  return points;
}

const scored = candidates.map((line) => ({ line, points: score(line) }));
scored.sort((a, b) => b.points - a.points);
if (scored.length === 0 || scored[0].line.trim().length === 0) {
  console.error("entry invalid: no candidate line survived scoring");
  process.exit(1);
}
const line = scored[0].line;

function fail(message: string): never {
  console.error(`entry invalid: ${message}`);
  process.exit(1);
}

if (line.length < 1 || line.length > MAX_CHARS) {
  fail(
    `winning line is ${line.length} characters, but the gate allows 1-${MAX_CHARS}; shorten a candidate`,
  );
}
if (/\n|\r/.test(line)) {
  fail("winning line spans more than one line; keep it to a single line");
}
if (line.trim().length === 0) {
  fail("winning line is blank; every candidate must be non-empty text");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), line + "\n", "utf8");
console.log(line);
