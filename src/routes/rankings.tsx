import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchBookEngagementStats, rankChallengeBooks, rankChallengeAuthors, type BookEngagementStat } from "@/lib/book-stats";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/rankings")({ component: RankingsPage });

function RankingsPage() {
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [stats, setStats] = useState<Record<string, BookEngagementStat>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("books").select("*"),
      fetchBookEngagementStats(),
    ]).then(([bookResult, statResult]) => {
      if (!active) return;
      setBooks(bookResult.data ?? []);
      setStats(statResult);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  const ranked = rankChallengeBooks(books, stats, 10);
  const authors = rankChallengeAuthors(books, stats);
  return <main className="mx-auto max-w-6xl px-4 py-14">
    <p className="chip">Community engagement</p><h1 className="mt-4 font-serif text-5xl font-semibold">Book & author rankings</h1>
    <p className="mt-4 max-w-2xl text-muted-foreground">Rankings are based on recorded community activity across comments, reader engagement and reviews. They are not paid placements.</p>
    {loading ? <p className="mt-8 text-muted-foreground">Loading rankings…</p> : <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <section className="glass rounded-2xl p-6"><h2 className="font-serif text-2xl font-semibold">Top books</h2><ol className="mt-5 space-y-4">{ranked.map((book,index) => { const s=stats[book.id]; return <li key={book.id} className="flex gap-4 border-b border-border pb-4"><span className="font-serif text-2xl text-accent">{index+1}</span><div className="min-w-0"><Link to="/books/$id" params={{id:book.id}} className="font-semibold hover:underline">{book.title}</Link><p className="text-sm text-muted-foreground">{book.author_name}</p><p className="mt-1 text-xs text-muted-foreground">{s?.challenge_comments ?? 0} discussion comments · {s?.review_count ?? 0} reviews · {s?.challenge_unique_readers ?? 0} challenge readers</p></div></li>})}{!ranked.length&&<p className="text-sm text-muted-foreground">No published books to rank yet.</p>}</ol></section>
      <section className="glass rounded-2xl p-6"><h2 className="font-serif text-2xl font-semibold">Top authors</h2><ol className="mt-5 space-y-4">{authors.map((author,index)=><li key={author.userId??author.name} className="border-b border-border pb-4"><div className="flex gap-4"><span className="font-serif text-2xl text-accent">{index+1}</span><div><p className="font-semibold">{author.name}</p><p className="mt-1 text-xs text-muted-foreground">{author.books} listed books · {author.comments} challenge comments · {author.reviews} reviews</p></div></div></li>)}{!authors.length&&<p className="text-sm text-muted-foreground">No author rankings yet.</p>}</ol></section>
    </div>}
    <p className="mt-6 text-xs text-muted-foreground">Method: the current ranking helper prioritizes recorded challenge comments, engagement score and unique challenge readers. Data may change as participation updates.</p>
  </main>;
}
