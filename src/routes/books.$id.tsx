import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { coverSrc } from "@/lib/covers";
import { fetchBookEngagementStats, isSpoiler, type BookEngagementStat } from "@/lib/book-stats";
import { AmbientPlayer } from "@/components/ambient-player";
import { BookReadingRoom } from "@/components/book-reading-room";
import type { Tables } from "@/integrations/supabase/types";
import { communityBookLinks } from "@/lib/community-books";
import { Button } from "@/components/ui/button";

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
  const [stat, setStat] = useState<BookEngagementStat>();
  const [chapter, setChapter] = useState(0);
  const [comments, setComments] = useState<Tables<"book_comments">[]>([]);
  const [reviews, setReviews] = useState<Tables<"book_reviews">[]>([]);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [helpfulByMe, setHelpfulByMe] = useState<Set<string>>(new Set());
  const [isMember, setIsMember] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState({ chapter: 1, body: "" });

  async function loadComments() {
    const { data } = await supabase.from("book_comments").select("*").eq("book_id", id).order("chapter").order("created_at");
    setComments(data ?? []);
  }
  async function loadReviews() {
    const [{ data: reviewData }, { data: helpfulData }] = await Promise.all([
      supabase.from("book_reviews").select("*").eq("book_id", id).order("created_at", { ascending: false }),
      supabase.rpc("book_review_helpful_counts"),
    ]);
    setReviews(reviewData ?? []);
    setHelpfulCounts(Object.fromEntries((helpfulData ?? []).map((row) => [row.review_id, Number(row.helpful_count)])));
  }
  useEffect(() => {
    supabase.from("books").select("*").eq("id", id).maybeSingle().then(({ data }) => setBook(data));
    fetchBookEngagementStats().then((s) => setStat(s[id]));
    void loadReviews();
  }, [id]);
  useEffect(() => {
    if (!user) { setIsMember(false); setHelpfulByMe(new Set()); return; }
    supabase.from("reading_progress").select("chapter").eq("book_id", id).maybeSingle().then(({ data }) => { setChapter(data?.chapter ?? 0); setDraft((d) => ({ ...d, chapter: Math.max(1, data?.chapter ?? 1) })); });
    void loadComments();
    supabase.from("community_members").select("user_id").eq("user_id", user.id).maybeSingle().then(({ data }) => setIsMember(Boolean(data)));
    supabase.from("book_review_helpful").select("review_id").eq("user_id", user.id).then(({ data }) => setHelpfulByMe(new Set((data ?? []).map((row) => row.review_id))));
  }, [user, id]);

  if (book === undefined) return <section className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Loading…</section>;
  if (!book) return <section className="mx-auto max-w-6xl px-4 py-20"><p>Book not found.</p><Link to="/books" className="btn-ink mt-4">All books</Link></section>;

  const total = book.total_chapters;
  async function saveProgress(c: number) {
    if (!user || !isMember) return;
    const v = Math.max(0, Math.min(total, c));
    setChapter(v);
    await supabase.from("reading_progress").upsert({ user_id: user.id, book_id: id, chapter: v, updated_at: new Date().toISOString() });
    if (v === total) await supabase.from("shelf").upsert({ user_id: user.id, book_id: id, status: "read", updated_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
    else if (v > 0) await supabase.from("shelf").upsert({ user_id: user.id, book_id: id, status: "reading", updated_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
  }
  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !isMember || !draft.body.trim()) return;
    const name = user.user_metadata?.['display_name'] ?? user.email?.split("@")[0] ?? "Reader";
    await supabase.from("book_comments").insert({ book_id: id, user_id: user.id, author_name: name, chapter: draft.chapter, body: draft.body.trim() });
    setDraft({ ...draft, body: "" });
    void loadComments();
  }
  async function saveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !isMember) return;
    const reviewerName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? "Reader").slice(0, 100);
    const { error } = await supabase.from("book_reviews").upsert({
      book_id: id, user_id: user.id, reviewer_name: reviewerName, rating: reviewRating, body: reviewBody.trim(), updated_at: new Date().toISOString(),
    }, { onConflict: "book_id,user_id" });
    setReviewNotice(error ? "Your review could not be saved. Please try again." : "Your rating and review are saved.");
    if (!error) {
      setReviewBody("");
      void loadReviews();
    }
  }
  async function toggleHelpful(reviewId: string) {
    if (!user || !isMember) return;
    const alreadyHelpful = helpfulByMe.has(reviewId);
    const result = alreadyHelpful
      ? await supabase.from("book_review_helpful").delete().eq("review_id", reviewId).eq("user_id", user.id)
      : await supabase.from("book_review_helpful").insert({ review_id: reviewId, user_id: user.id });
    if (result.error) return;
    setHelpfulByMe((current) => {
      const next = new Set(current);
      if (alreadyHelpful) next.delete(reviewId); else next.add(reviewId);
      return next;
    });
    void loadReviews();
  }
  async function reportReview(reviewId: string) {
    if (!user || !isMember) return;
    const reason = window.prompt("Why are you reporting this review?");
    if (!reason?.trim()) return;
    const { error } = await supabase.from("book_review_reports").insert({ review_id: reviewId, user_id: user.id, reason: reason.trim() });
    setReviewNotice(error ? "This review could not be reported." : "Thank you. The review was sent to our team.");
  }
  const src = coverSrc(book.cover_url);
  const ratingCounts = [1, 2, 3, 4, 5].map((rating) => reviews.filter((review) => review.rating === rating).length);
  const ratingTotal = reviews.length;
  const averageRating = ratingTotal ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingTotal : 0;

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
          {book.synopsis && <div className="mt-5"><h2 className="font-serif text-xl font-semibold">Synopsis</h2><p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{book.synopsis}</p></div>}
          {communityBookLinks[id] && <Button asChild variant="outline" className="mt-4"><a href={communityBookLinks[id]} target="_blank" rel="noopener noreferrer">View on Amazon ↗</a></Button>}
          <BookReadingRoom bookId={id} />
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="chip">★ {ratingTotal ? averageRating.toFixed(1) : "—"} · {ratingTotal} ratings</span>
            <span className="chip">{stat?.readers ?? 0} readers</span>
            <span className="chip">{stat?.comments ?? 0} chapter comments</span>
            <span className="chip">{stat?.readers ? Math.round((stat.finished / stat.readers) * 100) : 0}% completed</span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-mint">My reading progress</p>
              {user && isMember ? (
                <>
                  <p className="mt-2 font-serif text-2xl font-semibold">Chapter {chapter} of {total}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-mint" style={{ width: `${(chapter / total) * 100}%` }} /></div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => saveProgress(chapter - 1)} className="btn-glass !py-1.5">−</button>
                    <button onClick={() => saveProgress(chapter + 1)} className="btn-ink !py-1.5">+ Chapter</button>
                  </div>
                </>
              ) : user ? <p className="mt-2 text-sm text-muted-foreground">Request community access to track your reading. <Link to="/community/join" className="text-accent">Request access</Link>.</p> : <p className="mt-2 text-sm text-muted-foreground"><Link to="/auth" className="text-accent">Sign in</Link> to log your chapter.</p>}
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
            {isMember ? <form onSubmit={post} className="mt-5 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
              <select className="field" value={draft.chapter} onChange={(e) => setDraft({ ...draft, chapter: Number(e.target.value) })}>
                {Array.from({ length: total }, (_, i) => <option key={i} value={i + 1}>Chapter {i + 1}</option>)}
              </select>
              <input className="field" maxLength={4000} placeholder="Share a thought on this chapter…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              <button className="btn-ink">Post</button>
            </form> : <p className="mt-4 text-sm text-muted-foreground">Community access is required to join chapter discussions. <Link to="/community/join" className="text-accent">Request access</Link>.</p>}
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
              {!comments.length && isMember && <li className="text-sm text-muted-foreground">No chapter comments yet.</li>}
            </ul>
          </>
        )}
      </div>

      <section className="glass mt-8 rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-gold">Reader reviews</p><h2 className="mt-2 font-serif text-2xl font-semibold">Ratings & reviews</h2></div>
          <p className="text-sm text-muted-foreground">{ratingTotal ? `${averageRating.toFixed(1)} out of 5 · ${ratingTotal} ratings` : "No ratings yet"}</p>
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(12rem,0.7fr)_1.3fr]">
          <div className="grid gap-2" aria-label="Rating distribution">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating - 1] ?? 0;
              const percentage = ratingTotal ? Math.round((count / ratingTotal) * 100) : 0;
              return <div key={rating} className="grid grid-cols-[2rem_1fr_2.5rem] items-center gap-2 text-sm"><span>{rating} ★</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gold" style={{ width: `${percentage}%` }} /></div><span className="text-right text-muted-foreground">{count}</span></div>;
            })}
          </div>
          {user && isMember ? <form onSubmit={saveReview} className="grid gap-3">
            <label className="grid gap-2 text-sm font-semibold">Your rating
              <span className="flex gap-1">{[1, 2, 3, 4, 5].map((rating) => <Button key={rating} type="button" variant="ghost" size="icon" aria-label={`${rating} stars`} aria-pressed={reviewRating === rating} onClick={() => setReviewRating(rating)} className={rating <= reviewRating ? "text-gold" : "text-muted-foreground"}>★</Button>)}</span>
            </label>
            <textarea className="field" rows={4} maxLength={5000} placeholder="Write a review (optional)" value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} />
            <Button type="submit" className="justify-self-start">Save rating & review</Button>
          </form> : <p className="text-sm text-muted-foreground">{user ? <>Request community access to rate and review this book. <Link to="/community/join" className="text-accent">Request access</Link>.</> : <> <Link to="/auth" className="text-accent">Sign in</Link> and request community access to rate and review.</>}</p>}
        </div>
        {reviewNotice && <p role="status" className="mt-4 text-sm text-muted-foreground">{reviewNotice}</p>}
        <ul className="mt-7 grid gap-3">
          {reviews.filter((review) => review.body.trim()).map((review) => (
            <li key={review.id} className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{review.reviewer_name}</p><p className="text-sm text-gold">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div><time className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</time></div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{review.body}</p>
              <div className="mt-3 flex gap-4 text-xs">
                {user && isMember && review.user_id !== user.id && <button onClick={() => void toggleHelpful(review.id)} className="text-accent">{helpfulByMe.has(review.id) ? "Helpful" : "Mark helpful"} · {helpfulCounts[review.id] ?? 0}</button>}
                {user && isMember && review.user_id !== user.id && <button onClick={() => void reportReview(review.id)} className="text-muted-foreground">Report</button>}
                {(!user || !isMember) && <span className="text-muted-foreground">Helpful · {helpfulCounts[review.id] ?? 0}</span>}
              </div>
            </li>
          ))}
          {!reviews.some((review) => review.body.trim()) && <li className="text-sm text-muted-foreground">No written reviews yet.</li>}
        </ul>
      </section>
    </section>
  );
}
