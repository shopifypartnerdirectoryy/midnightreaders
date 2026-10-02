import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      { title: "Awards & Recognition — Midnight Readers Club" },
      { name: "description", content: "MRC awards and reader recognition, decided editorially and never sold." },
      { property: "og:title", content: "Awards & Recognition — Midnight Readers Club" },
      { property: "og:description", content: "Celebrating readers and authors across MRC programs." },
    ],
  }),
  component: Awards,
});

function Awards() {
  const [items, setItems] = useState<Tables<"awards">[]>([]);
  useEffect(() => { supabase.from("awards").select("*").order("year", { ascending: false }).then(({ data }) => setItems(data ?? [])); }, []);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Editorial · never sold</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Awards & Recognition</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Recognition is decided by MRC based on genuine participation. Paid programs never guarantee an award.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <article key={a.id} className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">{a.category ?? "Award"} · {a.year}</p>
            <h2 className="mt-2 font-serif text-xl font-semibold">{a.title}</h2>
            <p className="text-sm font-semibold">{a.recipient}</p>
            {a.note && <p className="mt-2 text-sm text-muted-foreground">{a.note}</p>}
          </article>
        ))}
        {!items.length && <div className="glass rounded-2xl p-6 text-muted-foreground">The first recognitions will be announced during the 2026 Reading Challenge.</div>}
      </div>
    </section>
  );
}
