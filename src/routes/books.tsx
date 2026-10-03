import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { coverSrc } from "@/lib/covers";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Book Discovery — Midnight Readers Club" },
      { name: "description", content: "Discover books featured across MRC programs and save them to your shelf." },
      { property: "og:title", content: "Book Discovery — Midnight Readers Club" },
      { property: "og:description", content: "Search books by title, author and genre." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<Record<string, string>>({});

  useEffect(() => { supabase.from("books").select("*").order("created_at", { ascending: false }).then(({ data }) => setBooks(data ?? [])); }, []);
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Book Discovery</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Find your next book</h1>
      <input className="field mt-6 max-w-md" placeholder="Search title, author or genre" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => {
          const src = coverSrc(b.cover_url);
          return (
            <article key={b.id} className="glass overflow-hidden rounded-2xl">
              {src && <img src={src} alt={`${b.title} cover`} loading="lazy" className="aspect-[3/4] w-full object-cover" />}
              <div className="p-5">
                {b.program && <span className="text-xs font-semibold uppercase tracking-widest text-accent">{b.program}</span>}
                <h2 className="mt-2 font-serif text-lg font-semibold">{b.title}</h2>
                <p className="text-sm text-muted-foreground">{b.author_name}{b.genre ? ` · ${b.genre}` : ""}</p>
                <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
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
    </section>
  );
}
