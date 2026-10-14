import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { coverSrc } from "@/lib/covers";
import { useAuth } from "@/hooks/use-auth";
import { fetchBookStats, rankTopBooks, completionRate, type BookStat } from "@/lib/book-stats";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/books/")({
  head: () => ({
    meta: [
      { title: "Book Discovery — Midnight Readers Club" },
      { name: "description", content: "Discover books from Midnight Readers Club and A Fourth Group & Co., see this week's top books and save them to your shelf." },
      { property: "og:title", content: "Book Discovery — Midnight Readers Club" },
      { property: "og:description", content: "Search books by title, author and genre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [stats, setStats] = useState<Record<string, BookStat>>({});
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Tables<"books"> | null>(null);

  useEffect(() => {
    supabase.from("books").select("*").order("created_at", { ascending: true }).then(({ data }) => setBooks(data ?? []));
    fetchBookStats().then(setStats);
  }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from("shelf").select("book_id,status").then(({ data }) => setShelf(Object.fromEntries((data ?? []).map((s) => [s.book_id, s.status]))));
  }, [user]);

  async function save(bookId: string, status: string) {
    if (!user) return;
    setShelf((s) => ({ ...s, [bookId]: status }));
    await supabase.from("shelf").upsert({ user_id: user.id, book_id: bookId, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
  }

  const term = q.toLowerCase();
  const list = books.filter((b) => [b.title, b.author_name, b.genre ?? ""].some((v) => v.toLowerCase().includes(term)));
  const top = rankTopBooks(books, stats);
  const maxAct = Math.max(1, ...top.map((b) => stats[b.id]?.week_activity ?? 0));

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Book Discovery</span>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-5xl font-semibold tracking-tight">Find your next book</h1>
        <Link to="/submit" className="btn-ink">＋ Add my book</Link>
      </div>

      {top.length > 0 && (
        <div className="glass-lg mt-8 rounded-[2rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Top books of the week</p>
          <ol className="mt-4 grid gap-3">
            {top.map((b, i) => {
              const s = stats[b.id];
              return (
                <li key={b.id}>
                  <Link to="/books/$id" params={{ id: b.id }} className="grid grid-cols-[2rem_1fr] items-center gap-3 sm:grid-cols-[2rem_1fr_220px]">
                    <span className="font-serif text-2xl font-semibold text-accent">{i + 1}</span>
                    <span><span className="font-semibold">{b.title}</span> <span className="text-sm text-muted-foreground">· {b.author_name}{b.genre ? ` · ${b.genre}` : ""}</span></span>
                    <span className="col-span-2 sm:col-span-1">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-gold" style={{ width: `${((s?.week_activity ?? 0) / maxAct) * 100}%` }} /></span>
                      <span className="mt-1 block text-xs text-muted-foreground">{s?.readers ?? 0} readers · {s?.comments ?? 0} comments · {completionRate(s)}% finished</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <input className="field mt-8 max-w-md" placeholder="Search title, author or genre" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => {
          const src = coverSrc(b.cover_url);
          const s = stats[b.id];
          return (
            <article key={b.id} className="glass flex flex-col overflow-hidden rounded-2xl">
              <Link to="/books/$id" params={{ id: b.id }}>
                {src ? <img src={src} alt={`${b.title} cover`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                  : <div className="glass-ink grid aspect-[3/4] place-items-center p-8 text-center font-serif text-2xl">{b.title}<span className="mt-2 block font-sans text-sm opacity-70">{b.author_name}</span></div>}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                {b.program && <span className="text-xs font-semibold uppercase tracking-widest text-accent">{b.program}</span>}
                <Link to="/books/$id" params={{ id: b.id }}><h2 className="mt-2 font-serif text-lg font-semibold">{b.title}</h2></Link>
                <p className="text-sm text-muted-foreground">{b.author_name}{b.genre ? ` · ${b.genre}` : ""}</p>
                <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">🔥 {s?.readers ?? 0} {s?.readers === 1 ? "reader" : "readers"} on MRC</p>
                <button onClick={() => setPreview(b)} className="mt-2 self-start text-sm font-semibold text-accent">Micro-preview →</button>
                {user ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {([["want", "Want to read"], ["reading", "Reading"], ["read", "Read"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => save(b.id, v)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${shelf[b.id] === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{l}</button>
                    ))}
                  </div>
                ) : <p className="mt-4 text-xs text-muted-foreground">Sign in to save to your shelf.</p>}
              </div>
            </article>
          );
        })}
        {!list.length && <p className="text-muted-foreground">No books match your search.</p>}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <aside role="dialog" aria-label="Book preview" className="glass-lg h-full w-full max-w-md overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} aria-label="Close" className="float-right text-muted-foreground">✕</button>
            <span className="chip">Micro-preview</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold">{preview.title}</h2>
            <p className="text-sm text-muted-foreground">{preview.author_name}</p>
            <div className="mt-6 whitespace-pre-line font-serif text-lg leading-relaxed">
              {preview.excerpt ?? preview.description}
            </div>
            {!preview.excerpt && <p className="mt-4 text-xs text-muted-foreground">A longer excerpt from the publisher is coming soon.</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/books/$id" params={{ id: preview.id }} className="btn-ink">Open book</Link>
              {!user && <Link to="/auth" className="btn-glass">Join to keep reading</Link>}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
