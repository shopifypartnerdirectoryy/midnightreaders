import { supabase } from "@/integrations/supabase/client";

export type BookStat = { book_id: string; readers: number; finished: number; week_activity: number; comments: number };
export type BookEngagementStat = {
  book_id: string;
  readers: number;
  finished: number;
  comments: number;
  average_rating: number;
  rating_count: number;
  review_count: number;
  votes: number;
  challenge_comments: number;
  challenge_completions: number;
  challenge_unique_readers: number;
  engagement_score: number;
};

export async function fetchBookStats(): Promise<Record<string, BookStat>> {
  const { data } = await supabase.rpc("book_stats");
  return Object.fromEntries((data ?? []).map((s) => [s.book_id, {
    book_id: s.book_id, readers: Number(s.readers), finished: Number(s.finished), week_activity: Number(s.week_activity), comments: Number(s.comments),
  }]));
}

export async function fetchBookEngagementStats(): Promise<Record<string, BookEngagementStat>> {
  const { data, error } = await supabase.rpc("book_engagement_stats");
  if (error) return {};
  return Object.fromEntries((data ?? []).map((stat) => [stat.book_id, {
    book_id: stat.book_id,
    readers: Number(stat.readers),
    finished: Number(stat.finished),
    comments: Number(stat.comments),
    average_rating: Number(stat.average_rating),
    rating_count: Number(stat.rating_count),
    review_count: Number(stat.review_count),
    votes: Number(stat.votes),
    challenge_comments: Number(stat.challenge_comments),
    challenge_completions: Number(stat.challenge_completions),
    challenge_unique_readers: Number(stat.challenge_unique_readers),
    engagement_score: Number(stat.engagement_score),
  }]));
}

export function rankChallengeBooks<T extends { id: string; title: string }>(
  books: T[],
  stats: Record<string, BookEngagementStat>,
  limit = 10,
): T[] {
  return [...books]
    .sort((a, b) => {
      const left = stats[a.id];
      const right = stats[b.id];
      return (right?.engagement_score ?? 0) - (left?.engagement_score ?? 0)
        || (right?.challenge_comments ?? 0) - (left?.challenge_comments ?? 0)
        || (right?.challenge_unique_readers ?? 0) - (left?.challenge_unique_readers ?? 0)
        || a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

export function rankChallengeAuthors<T extends { author_name: string; author_user_id?: string | null }>(
  books: T[],
  stats: Record<string, BookEngagementStat>,
) {
  const authors = new Map<string, {
    name: string;
    userId: string | null;
    books: number;
    engagement: number;
    comments: number;
    reviews: number;
    votes: number;
  }>();
  for (const book of books) {
    const key = book.author_user_id ?? book.author_name.trim().toLocaleLowerCase();
    const author = authors.get(key) ?? {
      name: book.author_name,
      userId: book.author_user_id ?? null,
      books: 0,
      engagement: 0,
      comments: 0,
      reviews: 0,
      votes: 0,
    };
    const stat = stats[(book as T & { id: string }).id];
    author.books += 1;
    author.engagement += stat?.engagement_score ?? 0;
    author.comments += stat?.challenge_comments ?? 0;
    author.reviews += stat?.review_count ?? 0;
    author.votes += stat?.votes ?? 0;
    authors.set(key, author);
  }
  return [...authors.values()]
    .sort((a, b) => b.engagement - a.engagement || b.comments - a.comments || a.name.localeCompare(b.name))
    .slice(0, 10);
}

/** Weekly ranking: most activity in the last 7 days, then readers, then title. */
export function rankTopBooks<T extends { id: string; title: string }>(books: T[], stats: Record<string, BookStat>, n = 5): T[] {
  const s = (id: string) => stats[id] ?? { week_activity: 0, readers: 0 };
  return [...books].sort((a, b) => s(b.id).week_activity - s(a.id).week_activity || s(b.id).readers - s(a.id).readers || a.title.localeCompare(b.title)).slice(0, n);
}

export const completionRate = (s?: BookStat) => (s && s.readers ? Math.round((s.finished / s.readers) * 100) : 0);

/** A comment is visible only when its chapter is at or before the reader's logged chapter. */
export const isSpoiler = (commentChapter: number, myChapter: number) => commentChapter > myChapter;
