const fs = require('fs');

function seededShuffle(arr, seed) {
  let s = seed;
  function rand() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function spreadByStart(arr) {
  const groups = {};
  for (const p of arr) {
    if (!groups[p.start]) groups[p.start] = [];
    groups[p.start].push(p);
  }
  const sorted = Object.values(groups).sort((a, b) => b.length - a.length);
  const result = [];
  const maxLen = Math.max(...sorted.map(g => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const g of sorted) {
      if (g[i]) result.push(g[i]);
    }
  }
  return result;
}

// Filter to min 4 steps, shuffle within groups, then spread
const p5raw = JSON.parse(fs.readFileSync('puzzles5.json'));
const filtered = p5raw.filter(p => p.path.length >= 5);

const byStart = {};
for (const p of filtered) {
  if (!byStart[p.start]) byStart[p.start] = [];
  byStart[p.start].push(p);
}
for (const k of Object.keys(byStart)) byStart[k] = seededShuffle(byStart[k], 42);
const final = spreadByStart(Object.values(byStart).flat());

// Verify
let consecutive = 0;
for (let i = 1; i < final.length; i++) {
  if (final[i].start === final[i-1].start) consecutive++;
}
const dist = {};
final.forEach(p => { const s = p.path.length - 1; dist[s] = (dist[s] || 0) + 1; });
console.log('Total:', final.length, '| Distribution:', dist, '| Consecutive same-start:', consecutive);

// Build replacement — keep short s/t/p format + .map() to match original structure
const entries = final.map(p => "{s:'" + p.start + "',t:'" + p.target + "',p:['" + p.path.join("','") + "']}");
const newData = 'const PUZZLES5 = [' + entries.join(',') + '].map(function(x){return{start:x.s,target:x.t,path:x.p};});';

// Find exact start and end of original PUZZLES5 block
const END_MARKER = '].map(function(x){return{start:x.s,target:x.t,path:x.p};});';
let html = fs.readFileSync('index.html', 'utf8');
const before = html.indexOf('const PUZZLES5 = [');
const afterIdx = html.indexOf(END_MARKER, before) + END_MARKER.length;

if (before === -1 || afterIdx < END_MARKER.length) {
  console.error('Could not find PUZZLES5 block — aborting');
  process.exit(1);
}

console.log('Replacing bytes', before, 'to', afterIdx, '(original length', afterIdx - before, ')');
html = html.slice(0, before) + newData + html.slice(afterIdx);
fs.writeFileSync('index.html', html);
console.log('Done.');
