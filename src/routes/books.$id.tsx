import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { coverSrc } from "@/lib/covers";
import { fetchBookStats, isSpoiler, completionRate, type BookStat } from "@/lib/book-stats";
import { AmbientPlayer } from "@/components/ambient-player";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/books/$id")({
  head: () => ({
    meta: [
      { title: "Book — Midnight Readers Club" },
      { name: "description", content: "Track your progress, join spoiler-safe chapter discussions and read with ambient sound." },
      { property: "og:title", content: "Book on Midnight Readers Club" },
      { property: "og:description", content: "Spoiler-safe chapter discussions and reading progress." },
      { property: "og:type", content: "book" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [book, setBook] = useState<Tables<"books"> | null | undefined>();
  const [stat, setStat] = useState<BookStat>();
  const [chapter, setChapter] = useState(0);
  const [comments, setComments] = useState<Tables<"book_comments">[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState({ chapter: 1, body: "" });

  async function loadComments() {
    const { data } = await supabase.from("book_comments").select("*").eq("book_id", id).order("chapter").order("created_at");
    setComments(data ?? []);
  }
  useEffect(() => {
    supabase.from("books").select("*").eq("id", id).maybeSingle().then(({ data }) => setBook(data));
    fetchBookStats().then((s) => setStat(s[id]));
  }, [id]);
  useEffect(() => {
    if (!user) return;
    supabase.from("reading_progress").select("chapter").eq("book_id", id).maybeSingle().then(({ data }) => { setChapter(data?.chapter ?? 0); setDraft((d) => ({ ...d, chapter: Math.max(1, data?.chapter ?? 1) })); });
    void loadComments();
  }, [user, id]);

  if (book === undefined) return <section className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Loading…</section>;
  if (!book) return <section className="mx-auto max-w-6xl px-4 py-20"><p>Book not found.</p><Link to="/books" className="btn-ink mt-4">All books</Link></section>;

  const total = book.total_chapters;
  async function saveProgress(c: number) {
    if (!user) return;
    const v = Math.max(0, Math.min(total, c));
    setChapter(v);
    await supabase.from("reading_progress").upsert({ user_id: user.id, book_id: id, chapter: v, updated_at: new Date().toISOString() });
    if (v === total) await supabase.from("shelf").upsert({ user_id: user.id, book_id: id, status: "read", updated_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
    else if (v > 0) await supabase.from("shelf").upsert({ user_id: user.id, book_id: id, status: "reading", updated_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
  }
  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !draft.body.trim()) return;
    const name = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Reader";
    await supabase.from("book_comments").insert({ book_id: id, user_id: user.id, author_name: name, chapter: draft.chapter, body: draft.body.trim() });
    setDraft({ ...draft, body: "" });
    void loadComments();
  }
  const src = coverSrc(book.cover_url);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <Link to="/books" className="text-sm font-semibold text-accent">← All books</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          {src ? <img src={src} alt={`${book.title} cover`} className="aspect-[3/4] w-full rounded-2xl object-cover" />
            : <div className="glass-ink grid aspect-[3/4] place-items-center rounded-2xl p-6 text-center font-serif text-xl">{book.title}</div>}
        </div>
        <div>
          {book.program && <span className="text-xs font-semibold uppercase tracking-widest text-accent">{book.program}</span>}
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">{book.title}</h1>
          <p className="mt-1 text-muted-foreground">{book.author_name}{book.genre ? ` · ${book.genre}` : ""}</p>
          <p className="mt-4 leading-relaxed">{book.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="chip">🔥 {stat?.readers ?? 0} {stat?.readers === 1 ? "reader" : "readers"} on MRC</span>
            <span className="chip">{stat?.comments ?? 0} chapter comments</span>
            <span className="chip">{completionRate(stat)}% completion</span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-mint">My reading progress</p>
              {user ? (
                <>
                  <p className="mt-2 font-serif text-2xl font-semibold">Chapter {chapter} of {total}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-mint" style={{ width: `${(chapter / total) * 100}%` }} /></div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => saveProgress(chapter - 1)} className="btn-glass !py-1.5">−</button>
                    <button onClick={() => saveProgress(chapter + 1)} className="btn-ink !py-1.5">+ Chapter</button>
                  </div>
                </>
              ) : <p className="mt-2 text-sm text-muted-foreground"><Link to="/auth" className="text-accent">Sign in</Link> to log your chapter.</p>}
            </div>
            <AmbientPlayer />
          </div>
        </div>
      </div>

      <div className="glass mt-10 rounded-[2rem] p-8">
        <h2 className="font-serif text-2xl font-semibold">Spoiler-safe chapter threads</h2>
        <p className="mt-1 text-sm text-muted-foreground">Comments from chapters past your logged progress stay blurred.</p>
        {!user ? <p className="mt-4 text-sm"><Link to="/auth" className="text-accent">Sign in</Link> to read and join chapter threads.</p> : (
          <>
            <form onSubmit={post} className="mt-5 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
              <select className="field" value={draft.chapter} onChange={(e) => setDraft({ ...draft, chapter: Number(e.target.value) })}>
                {Array.from({ length: total }, (_, i) => <option key={i} value={i + 1}>Chapter {i + 1}</option>)}
              </select>
              <input className="field" maxLength={4000} placeholder="Share a thought on this chapter…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              <button className="btn-ink">Post</button>
            </form>
            <ul className="mt-6 grid gap-3">
              {comments.map((c) => {
                const locked = isSpoiler(c.chapter, chapter) && !revealed.has(c.id) && c.user_id !== user.id;
                return (
                  <li key={c.id} className="glass relative rounded-xl p-4">
                    <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{c.author_name}</span> · Chapter {c.chapter}</p>
                    <p className={`mt-1 text-sm ${locked ? "select-none blur-sm" : ""}`}>{c.body}</p>
                    {locked && (
                      <button onClick={() => setRevealed(new Set(revealed).add(c.id))} className="absolute inset-0 grid place-items-center rounded-xl text-xs font-semibold">
                        🔒 Chapter {c.chapter} spoiler — tap to reveal
                      </button>
                    )}
                  </li>
                );
              })}
              {!comments.length && <li className="text-sm text-muted-foreground">No comments yet — start the first chapter thread.</li>}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
