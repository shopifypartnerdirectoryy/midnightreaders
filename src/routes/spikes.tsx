import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/spikes")({
  head: () => ({
    meta: [
      { title: "Midnight Spikes — Midnight Readers Club" },
      { name: "description", content: "Short literary drops: prompts, picks and reading tips from MRC." },
      { property: "og:title", content: "Midnight Spikes — Midnight Readers Club" },
      { property: "og:description", content: "Short, sharp literary drops after dark." },
    ],
  }),
  component: Spikes,
});

function Spikes() {
  const [items, setItems] = useState<Tables<"spikes">[]>([]);
  const [cat, setCat] = useState("All");
  useEffect(() => { supabase.from("spikes").select("*").eq("published", true).order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? [])); }, []);
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const list = cat === "All" ? items : items.filter((i) => i.category === cat);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Free · by MRC</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Midnight Spikes</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cat === c ? "bg-primary text-primary-foreground" : "glass"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <article key={s.id} className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-mint">{s.category}</p>
            <h2 className="mt-2 font-serif text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            <p className="mt-4 text-xs text-muted-foreground">Official MRC · {new Date(s.created_at).toLocaleDateString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
