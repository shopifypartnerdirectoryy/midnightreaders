import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { programs } from "@/lib/mrc-data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Midnight Readers Club" },
      { name: "description", content: "Search books, authors, programs, Midnight Spikes and awards across MRC." },
      { property: "og:title", content: "Search Midnight Readers Club" },
      { property: "og:description", content: "Find books, authors, programs and Midnight Spikes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

type Hit = { kind: string; title: string; sub: string; to: string; params?: Record<string, string> };

function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      const like = `%${term.replace(/[%_,()]/g, "")}%`;
      const [b, s, a] = await Promise.all([
        supabase.from("books").select("id,title,author_name,genre").or(`title.ilike.${like},author_name.ilike.${like},genre.ilike.${like}`).limit(20),
        supabase.from("spikes").select("id,title,category").or(`title.ilike.${like},body.ilike.${like}`).limit(20),
        supabase.from("awards").select("id,title,recipient,year").or(`title.ilike.${like},recipient.ilike.${like}`).limit(20),
      ]);
      const low = term.toLowerCase();
      setHits([
        ...programs.filter((p) => [p.name, p.short].some((v) => v.toLowerCase().includes(low)))
          .map((p) => ({ kind: "Program", title: p.name, sub: p.access, to: "/programs/$slug", params: { slug: p.slug } })),
        ...(b.data ?? []).map((x) => ({ kind: "Book", title: x.title, sub: `${x.author_name}${x.genre ? ` · ${x.genre}` : ""}`, to: "/books" })),
        ...(s.data ?? []).map((x) => ({ kind: "Spike", title: x.title, sub: x.category, to: "/spikes" })),
        ...(a.data ?? []).map((x) => ({ kind: "Award", title: x.title, sub: `${x.recipient} · ${x.year}`, to: "/awards" })),
      ]);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <span className="chip">Search</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Search MRC</h1>
      <input autoFocus className="field mt-6" placeholder="Books, authors, programs, spikes…" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-6 grid gap-2">
        {hits.map((h, i) => (
          <li key={i}>
            <Link to={h.to} params={h.params as never} className="glass flex items-center justify-between gap-3 rounded-xl px-5 py-3">
              <span><span className="font-semibold">{h.title}</span> <span className="text-sm text-muted-foreground">· {h.sub}</span></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">{h.kind}</span>
            </Link>
          </li>
        ))}
        {q.trim().length >= 2 && !hits.length && <li className="text-muted-foreground">No results.</li>}
      </ul>
    </section>
  );
}
