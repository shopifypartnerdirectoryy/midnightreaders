import { supabase } from "@/integrations/supabase/client";

export type BookStat = { book_id: string; readers: number; finished: number; week_activity: number; comments: number };

export async function fetchBookStats(): Promise<Record<string, BookStat>> {
  const { data } = await supabase.rpc("book_stats");
  return Object.fromEntries((data ?? []).map((s) => [s.book_id, {
    book_id: s.book_id, readers: Number(s.readers), finished: Number(s.finished), week_activity: Number(s.week_activity), comments: Number(s.comments),
  }]));
}

/** Weekly ranking: most activity in the last 7 days, then readers, then title. */
export function rankTopBooks<T extends { id: string; title: string }>(books: T[], stats: Record<string, BookStat>, n = 5): T[] {
  const s = (id: string) => stats[id] ?? { week_activity: 0, readers: 0 };
  return [...books].sort((a, b) => s(b.id).week_activity - s(a.id).week_activity || s(b.id).readers - s(a.id).readers || a.title.localeCompare(b.title)).slice(0, n);
}

export const completionRate = (s?: BookStat) => (s && s.readers ? Math.round((s.finished / s.readers) * 100) : 0);

/** A comment is visible only when its chapter is at or before the reader's logged chapter. */
export const isSpoiler = (commentChapter: number, myChapter: number) => commentChapter > myChapter;
