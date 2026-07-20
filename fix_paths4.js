#!/usr/bin/env node
// Recomputes PUZZLES4 shortest paths using the same ALL_WORDS4 dictionary
// that the game uses for word validation, then patches index.html in place.
// Floors at 3 steps minimum: if BFS finds a shorter path, keeps the original.

const fs = require('fs');
const { execSync } = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');

// Extract ALL_WORDS4 word list
const m = html.match(/const ALL_WORDS4 = new Set\('([^']+)'\.split/);
if (!m) { console.error('Could not find ALL_WORDS4'); process.exit(1); }
const ALL_WORDS4 = new Set(m[1].split(' '));
console.log('ALL_WORDS4 size:', ALL_WORDS4.size);

// Get original paths from git (before any fix_paths4 runs)
const origHtml = execSync('git show HEAD:index.html').toString();
const origMatch = origHtml.match(/const PUZZLES4 = \[(.+?)\]\.map\(function/s);
if (!origMatch) { console.error('Could not find original PUZZLES4 in git HEAD'); process.exit(1); }
const origPaths = {};
for (const e of origMatch[1].matchAll(/s:'([A-Z]+)',t:'([A-Z]+)',p:\['([^']+(?:','[^']+)*)'\]/g)) {
  origPaths[e[1] + '→' + e[2]] = e[3].split("','");
}

// Extract existing PUZZLES4 pairs (order matters for daily puzzle index)
const p4match = html.match(/const PUZZLES4 = \[(.+?)\]\.map\(function/s);
if (!p4match) { console.error('Could not find PUZZLES4'); process.exit(1); }

const pairs = [];
for (const entry of p4match[1].matchAll(/\{s:'([A-Z]+)',t:'([A-Z]+)',p:\[/g)) {
  pairs.push({ start: entry[1], target: entry[2] });
}
console.log('Puzzles to recompute:', pairs.length);

function neighbors(word) {
  const out = [];
  for (let i = 0; i < word.length; i++) {
    for (let c = 65; c <= 90; c++) {
      if (word.charCodeAt(i) === c) continue;
      const candidate = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
      if (ALL_WORDS4.has(candidate)) out.push(candidate);
    }
  }
  return out;
}

function bfs(start, target) {
  if (start === target) return [start];
  const queue = [[start]], visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    for (const w of neighbors(path[path.length - 1])) {
      if (visited.has(w)) continue;
      const next = [...path, w];
      if (w === target) return next;
      visited.add(w);
      queue.push(next);
    }
  }
  return null;
}

const MIN_STEPS = 3; // floor: never show fewer than this many steps

const results = [];
let shortened = 0, floored = 0;
for (const { start, target } of pairs) {
  const path = bfs(start, target);
  if (!path) { console.error(`No path found: ${start} → ${target}`); process.exit(1); }
  const key = start + '→' + target;
  const steps = path.length - 1;
  if (steps < MIN_STEPS && origPaths[key]) {
    results.push({ start, target, path: origPaths[key] });
    console.log(`  ${start}→${target}: BFS found ${steps} steps — keeping original ${origPaths[key].length - 1} steps`);
    floored++;
  } else {
    results.push({ start, target, path });
  }
}

// Compare with original paths to report improvements
const origLengths = [];
for (const entry of p4match[1].matchAll(/p:\['([^']+(?:','[^']+)*)'\]/g)) {
  origLengths.push(entry[1].split("','").length);
}
for (let i = 0; i < results.length; i++) {
  const orig = origLengths[i];
  const newLen = results[i].path.length;
  if (newLen < orig) {
    console.log(`  ${results[i].start}→${results[i].target}: ${orig-1} steps → ${newLen-1} steps (saved ${orig-newLen})`);
    shortened++;
  }
}
console.log(`\nTotal puzzles shortened: ${shortened} / ${pairs.length} (${floored} floored at ${MIN_STEPS} steps)`);

// Build replacement PUZZLES4 block
const entries = results.map(p =>
  "{s:'" + p.start + "',t:'" + p.target + "',p:['" + p.path.join("','") + "']}"
);
const END_MARKER = '].map(function(x){return{start:x.s,target:x.t,path:x.p};});';
const newBlock = 'const PUZZLES4 = [' + entries.join(',') + END_MARKER;

const before = html.indexOf('const PUZZLES4 = [');
const afterIdx = html.indexOf(END_MARKER, before) + END_MARKER.length;
if (before === -1 || afterIdx < END_MARKER.length) {
  console.error('Could not locate PUZZLES4 block for replacement'); process.exit(1);
}

const patched = html.slice(0, before) + newBlock + html.slice(afterIdx);
fs.writeFileSync('index.html', patched);
console.log('index.html patched.');
