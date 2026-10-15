import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { communityBookIds } from "@/lib/community-books";
import { coverSrc } from "@/lib/covers";

export function CommunityBookshelf({ community = false }: { community?: boolean }) {
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.from("books").select("*").in("id", communityBookIds).then(({ data, error }) => {
      if (!active) return;
      setFailed(Boolean(error));
      setBooks((data ?? []).sort((a, b) => communityBookIds.indexOf(a.id) - communityBookIds.indexOf(b.id)));
    });
    return () => { active = false; };
  }, []);

  return <section aria-label="Real books by real authors" className={community ? "py-4" : "mx-auto max-w-6xl px-4 py-12"}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className={`text-xs font-semibold uppercase tracking-widest ${community ? "text-community-gold" : "text-accent"}`}>Community book discovery</p><h2 className="mt-2 font-serif text-3xl font-semibold">Real books by real authors.</h2></div>
      <Link to="/books" className={`text-sm font-semibold ${community ? "text-community-gold" : "text-accent"}`}>View all books →</Link>
    </div>
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => {
        const src = coverSrc(book.cover_url);
        return <article key={book.id} className={`flex min-w-0 flex-col overflow-hidden rounded-lg ${community ? "border border-community-border bg-community-surface" : "glass"}`}>
          <Link to="/books/$id" params={{ id: book.id }} className={`flex h-64 items-center justify-center p-4 ${community ? "bg-community-soft" : "bg-muted"}`}>
            {src && <img src={src} alt={`${book.title} cover`} loading="lazy" className="h-full max-w-full object-contain" />}
          </Link>
          <div className="flex flex-1 flex-col p-5">
            <p className={`text-xs font-semibold ${community ? "text-community-gold" : "text-accent"}`}>{book.genre}</p>
            <Link to="/books/$id" params={{ id: book.id }}><h3 className="mt-2 break-words font-serif text-lg font-semibold">{book.title}</h3></Link>
            <p className={`mt-1 text-sm ${community ? "text-community-muted" : "text-muted-foreground"}`}>{book.author_name}</p>
            <p className={`mt-3 line-clamp-3 text-sm leading-relaxed ${community ? "text-community-muted" : "text-muted-foreground"}`}>{book.description}</p>
            <Link to="/books/$id" params={{ id: book.id }} className={`mt-4 pt-2 text-sm font-semibold ${community ? "text-community-gold" : "text-accent"}`}>Open reading room →</Link>
          </div>
        </article>;
      })}
    </div>
    {failed && <p role="status" className="mt-4 text-sm">The books couldn’t load. Please refresh to try again.</p>}
  </section>;
}