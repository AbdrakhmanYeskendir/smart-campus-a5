// Duplication report (no dependencies). Usage: node scripts/dup_report.mjs [srcDir]
// Measures TEXTUAL duplication in non-test .ts/.tsx files:
//  1. duplicated blocks: runs of lines covered by a window of 3 consecutive
//     significant lines (>= 60 characters) that appears at least twice;
//  2. repeated long literals: string literals of >= 40 characters used more than once.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'src';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(root).filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.ts$/.test(f) && !f.endsWith('.d.ts'));
const SKIP = /^(import |export \{|\}|\)|\);|\},?|\}\);|\]|\/\/|\/\*|\*)/;

const lines = []; // significant lines per file
for (const file of files) {
  const raw = readFileSync(file, 'utf8').split('\n');
  const kept = [];
  raw.forEach((text, i) => {
    const t = text.trim();
    if (t === '' || SKIP.test(t) || /^\{\/\*.*\*\/\}$/.test(t)) return;
    kept.push({ file, no: i + 1, t });
  });
  lines.push(kept);
}

const windows = new Map();
lines.forEach((kept, fi) => {
  for (let i = 0; i + 2 < kept.length; i++) {
    const text = kept[i].t + '\n' + kept[i + 1].t + '\n' + kept[i + 2].t;
    if (text.length < 60) continue;
    if (!windows.has(text)) windows.set(text, []);
    windows.get(text).push([fi, i]);
  }
});

const marked = lines.map((kept) => new Array(kept.length).fill(false));
for (const spots of windows.values()) {
  if (spots.length < 2) continue;
  for (const [fi, i] of spots) for (let k = 0; k < 3; k++) marked[fi][i + k] = true;
}
let blocks = 0;
let dupLines = 0;
const where = [];
marked.forEach((flags, fi) => {
  let start = -1;
  flags.forEach((on, i) => {
    if (on) dupLines++;
    if (on && start < 0) start = i;
    if ((!on || i === flags.length - 1) && start >= 0) {
      blocks++;
      const endIdx = on ? i : i - 1;
      where.push(`${lines[fi][start].file}:${lines[fi][start].no}-${lines[fi][endIdx].no}`);
      start = -1;
    }
  });
});

const literals = new Map();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(["'])((?:(?!\1)[^\n\\]){40,})\1/g)) {
    literals.set(m[2], (literals.get(m[2]) ?? 0) + 1);
  }
}
const repeated = [...literals.values()].filter((n) => n > 1);
const extra = repeated.reduce((sum, n) => sum + n - 1, 0);

const total = lines.reduce((sum, kept) => sum + kept.length, 0);
console.log(JSON.stringify({
  files: files.length,
  significantLines: total,
  duplicatedBlocks: blocks,
  duplicatedLines: dupLines,
  repeatedLongLiterals: repeated.length,
  extraCopiesOfLongLiterals: extra,
  blockLocations: where,
}, null, 2));
