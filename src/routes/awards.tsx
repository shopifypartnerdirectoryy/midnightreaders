import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchBookEngagementStats, rankChallengeBooks, rankChallengeAuthors, type BookEngagementStat } from "@/lib/book-stats";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      { title: "Awards & Recognition — Midnight Readers Club" },
      { name: "description", content: "MRC awards, genuine reader engagement leaderboards and recognition." },
      { property: "og:title", content: "Awards & Recognition — Midnight Readers Club" },
      { property: "og:description", content: "Celebrating readers and authors across MRC programs." },
    ],
  }),
  component: Awards,
});

function Awards() {
  const [items, setItems] = useState<Tables<"awards">[]>([]);
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [stats, setStats] = useState<Record<string, BookEngagementStat>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [awardResult, bookResult, engagement] = await Promise.all([
        supabase.from("awards").select("*").order("year", { ascending: false }),
        supabase.from("books").select("*"),
        fetchBookEngagementStats(),
      ]);
      if (!active) return;
      if (bookResult.error) setError("The competition rankings could not be loaded. Please try again later.");
      setItems(awardResult.data ?? []);
      setBooks(bookResult.data ?? []);
      setStats(engagement);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const topBooks = rankChallengeBooks(books, stats, 10);
  const topAuthors = rankChallengeAuthors(books, stats);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Recognition · based on genuine participation</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Awards & Recognition</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Celebrate books and authors whose work inspires real participation in the Midnight Readers Club. Rankings reflect recorded engagement and are not influenced by paid placement.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="glass-lg rounded-[2rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">2026 Reading Challenge</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Top 10 Books</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ranked by challenge discussion activity, overall engagement and unique challenge readers.</p>
          {loading ? <p className="mt-5 text-sm text-muted-foreground">Loading rankings…</p> : error ? <p className="mt-5 text-sm text-destructive">{error}</p> : topBooks.length ? (
            <ol className="mt-6 grid gap-3">
              {topBooks.map((book, index) => {
                const s = stats[book.id];
                return <li key={book.id} className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0">
                  <span className="font-serif text-2xl font-semibold text-accent">{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{book.title}</p><p className="text-sm text-muted-foreground">{book.author_name}</p><p className="mt-1 text-xs text-muted-foreground">{s?.challenge_comments ?? 0} challenge comments · {s?.challenge_unique_readers ?? 0} challenge readers</p></div>
                  <span className="text-sm font-semibold tabular-nums">{Math.round(s?.engagement_score ?? 0)}<span className="text-xs text-muted-foreground"> pts</span></span>
                </li>;
              })}
            </ol>
          ) : <p className="mt-5 text-sm text-muted-foreground">Rankings will appear as readers participate in the challenge.</p>}
        </section>

        <section className="glass-lg rounded-[2rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-mint">2026 Reading Challenge</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Top 10 Authors</h2>
          <p className="mt-2 text-sm text-muted-foreground">Authors are grouped by linked author account when available; otherwise, books are grouped by author name.</p>
          {loading ? <p className="mt-5 text-sm text-muted-foreground">Loading rankings…</p> : error ? <p className="mt-5 text-sm text-destructive">{error}</p> : topAuthors.length ? (
            <ol className="mt-6 grid gap-3">
              {topAuthors.map((author, index) => <li key={author.userId ?? author.name.toLocaleLowerCase()} className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0">
                <span className="font-serif text-2xl font-semibold text-accent">{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{author.name}</p><p className="text-sm text-muted-foreground">{author.books} {author.books === 1 ? "book" : "books"} · {author.comments} challenge comments · {author.reviews} reviews</p></div>
                <span className="text-sm font-semibold tabular-nums">{Math.round(author.engagement)}<span className="text-xs text-muted-foreground"> pts</span></span>
              </li>)}
            </ol>
          ) : <p className="mt-5 text-sm text-muted-foreground">Author rankings will appear as readers participate in the challenge.</p>}
        </section>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Scores are derived from the platform’s engagement aggregation. Rankings are subject to moderation and data availability.</p>

      <h2 className="mt-14 font-serif text-3xl font-semibold">Awards & Recognition</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">Editorial awards are decided by MRC based on genuine participation. Paid programs never guarantee an award.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => <article key={a.id} className="glass rounded-2xl p-6"><p className="text-xs font-semibold uppercase tracking-widest text-gold">{a.category ?? "Award"} · {a.year}</p><h3 className="mt-2 font-serif text-xl font-semibold">{a.title}</h3><p className="text-sm font-semibold">{a.recipient}</p>{a.note && <p className="mt-2 text-sm text-muted-foreground">{a.note}</p>}</article>)}
        {!items.length && <div className="glass rounded-2xl p-6 text-muted-foreground">The first recognitions will be announced during the 2026 Reading Challenge.</div>}
      </div>
    </section>
  );
}
