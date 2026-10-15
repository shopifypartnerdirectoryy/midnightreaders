/** Display-only demo stats and bot comments: never write these to engagement records. */
const seedOf = (id: string) => Array.from(id).reduce((s, c) => s + c.charCodeAt(0), 0);

export function demoBookStats(bookId: string, tick: number) {
  const seed = seedOf(bookId);
  const step = Math.max(0, Math.floor(tick));
  const readers = 1200 + (seed % 800) + step * 7;
  const comments = 140 + (seed % 90) + step * 2;
  const completion = 38 + (seed % 35);
  return { readers, comments, completion };
}

const lines = [
  "This chapter hit harder than I expected — the pacing is perfect.",
  "Loving the main character's voice so far.",
  "Anyone else reading this at midnight with tea? ☕",
  "That ending twist… I need to talk about it!",
  "The writing feels so honest. Highlighting half the page.",
  "Just joined the buddy read for this one — who's in?",
];
const names = ["MRC Bot · Nova", "MRC Bot · Ember", "MRC Bot · Sage", "MRC Bot · Orion"];

export function demoBotComments(bookId: string, tick: number, totalChapters: number, n = 3) {
  const seed = seedOf(bookId);
  return Array.from({ length: n }, (_, i) => {
    const k = seed + tick + i * 3;
    return { id: `bot-${i}-${k}`, author: names[k % names.length], chapter: 1 + (k % Math.max(1, totalChapters)), body: lines[k % lines.length] };
  });
}
