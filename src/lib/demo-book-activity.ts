/** Display-only scenarios: never write these numbers to engagement records. */
export const DEMO_ACTIVITY_INTERVAL = 12000;

export function demoBookActivity(bookId: string, tick: number) {
  const step = Math.max(0, Math.floor(tick));
  const seed = Array.from(bookId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const phase = step % 4;
  const variation = step === 0 ? 0 : ((seed + step * 37) % 180);
  if (phase === 0) return { count: 5000 + variation, label: "currently checking this book" };
  if (phase === 1) return { count: 1000 + variation, label: "currently reading this book" };
  if (phase === 2) return { count: 2300 + variation, label: "exploring this book" };
  return { count: 1400 + variation, label: "currently reading this book" };
}