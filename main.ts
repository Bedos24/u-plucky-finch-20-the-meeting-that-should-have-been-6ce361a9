// The Meeting That Should Have Been an Email — entry program.
//
// The whole entry is one joke, exactly one line, at most 200 characters.
// Rather than hard-coding a flat string, the line is assembled from its
// two beats — the setup (what the meeting produced) and the turn (what it
// produced it about) — so the punch lands on the last word. The program
// validates the result against the gate (1-200 chars, single line, UTF-8,
// non-blank) and writes it to the harness output directory, then prints
// the same line to stdout.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;

// Beat 1: the meeting's entire output, stated deadpan.
// Beat 2: the thing that output exists to do — the email the meeting
// itself replaced. The recursion is the joke: the meeting only exists
// to schedule its own replacement.
const beats: string[] = [
  "The meeting's only action item was to schedule a second meeting",
  "to draft the email the first meeting had replaced.",
];

const line = beats.join(" ");

function fail(message: string): never {
  console.error(`entry invalid: ${message}`);
  process.exit(1);
}

if (line.length < 1 || line.length > MAX_CHARS) {
  fail(`line is ${line.length} characters, gate allows 1-${MAX_CHARS}`);
}
if (line.trim().length === 0 || /\n|\r/.test(line)) {
  fail("line must be a single non-blank line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), line + "\n", "utf8");
console.log(line);
