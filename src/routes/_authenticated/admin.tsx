import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Midnight Readers Club" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const tabs = ["Overview", "Submissions", "Books", "Spikes", "Awards", "Inquiries"] as const;

function Admin() {
  const { isAdmin, ready } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [subs, setSubs] = useState<Tables<"book_submissions">[]>([]);
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [spikes, setSpikes] = useState<Tables<"spikes">[]>([]);
  const [awards, setAwards] = useState<Tables<"awards">[]>([]);
  const [inq, setInq] = useState<Tables<"inquiries">[]>([]);
  const [counts, setCounts] = useState({ members: 0, enrolled: 0 });

  async function load() {
    const [a, b, c, d, e, m, en] = await Promise.all([
      supabase.from("book_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      supabase.from("spikes").select("*").order("created_at", { ascending: false }),
      supabase.from("awards").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("challenge_enrollments").select("user_id", { count: "exact", head: true }),
    ]);
    setSubs(a.data ?? []); setBooks(b.data ?? []); setSpikes(c.data ?? []); setAwards(d.data ?? []); setInq(e.data ?? []);
    setCounts({ members: m.count ?? 0, enrolled: en.count ?? 0 });
  }
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  if (!ready) return null;
  if (!isAdmin) return <div className="mx-auto max-w-md px-4 py-20 text-center"><p className="text-muted-foreground">Admins only.</p><Link to="/dashboard" className="btn-ink mt-4">My dashboard</Link></div>;

  async function review(s: Tables<"book_submissions">, status: "approved" | "rejected") {
    const note = status === "rejected" ? prompt("Note for the author (optional)") : null;
    await supabase.from("book_submissions").update({ status, admin_note: note }).eq("id", s.id);
    if (status === "approved") await supabase.from("books").insert({ title: s.title, author_name: s.author_name, genre: s.genre, description: s.description, cover_url: s.cover_url, program: s.programs[0] ?? null });
    void load();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">Admin</span>
      <h1 className="mt-3 font-serif text-4xl font-semibold">MRC Control Room</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "glass"}`}>{t}</button>)}
      </div>
      <div className="mt-6">
        {tab === "Overview" && (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[["Members", counts.members], ["In challenge", counts.enrolled], ["Pending books", subs.filter((s) => s.status === "pending").length], ["Books", books.length], ["Spikes", spikes.length], ["Inquiries", inq.length]].map(([l, v]) => (
              <div key={l} className="glass rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p><p className="mt-2 font-serif text-3xl font-semibold">{v}</p></div>
            ))}
          </div>
        )}
        {tab === "Submissions" && (
          <div className="grid gap-3">
            {subs.map((s) => (
              <div key={s.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
                <div><p className="font-semibold">{s.title} <span className="font-normal text-muted-foreground">· {s.author_name}</span></p><p className="text-sm text-muted-foreground">{s.programs.join(", ") || "No program"} · <span className="capitalize">{s.status}</span></p></div>
                {s.status === "pending" && <div className="flex gap-2"><button onClick={() => review(s, "approved")} className="btn-ink !py-2">Approve</button><button onClick={() => review(s, "rejected")} className="btn-glass !py-2">Reject</button></div>}
              </div>
            ))}
            {!subs.length && <p className="text-muted-foreground">No submissions yet.</p>}
          </div>
        )}
        {tab === "Books" && <CrudList rows={books} label={(b) => `${b.title} · ${b.author_name}`} onDelete={async (id) => { await supabase.from("books").delete().eq("id", id); void load(); }}
          form={<SimpleForm fields={["title", "author_name", "genre", "description", "cover_url", "program"]} onSave={async (v) => { await supabase.from("books").insert(v as never); void load(); }} />} />}
        {tab === "Spikes" && <CrudList rows={spikes} label={(s) => `${s.category} · ${s.title}`} onDelete={async (id) => { await supabase.from("spikes").delete().eq("id", id); void load(); }}
          form={<SimpleForm fields={["title", "category", "body"]} onSave={async (v) => { await supabase.from("spikes").insert(v as never); void load(); }} />} />}
        {tab === "Awards" && <CrudList rows={awards} label={(a) => `${a.year} · ${a.title} — ${a.recipient}`} onDelete={async (id) => { await supabase.from("awards").delete().eq("id", id); void load(); }}
          form={<SimpleForm fields={["title", "recipient", "category", "note"]} onSave={async (v) => { await supabase.from("awards").insert(v as never); void load(); }} />} />}
        {tab === "Inquiries" && (
          <div className="grid gap-3">
            {inq.map((i) => <div key={i.id} className="glass rounded-2xl p-5"><p className="font-semibold">{i.name} <span className="font-normal text-muted-foreground">· {i.email} · {i.program}</span></p>{i.message && <p className="mt-1 text-sm text-muted-foreground">{i.message}</p>}</div>)}
            {!inq.length && <p className="text-muted-foreground">No inquiries yet.</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function CrudList<T extends { id: string }>({ rows, label, onDelete, form }: { rows: T[]; label: (r: T) => string; onDelete: (id: string) => void; form: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div className="glass rounded-2xl p-5">{form}</div>
      <ul className="grid content-start gap-2">
        {rows.map((r) => <li key={r.id} className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm"><span>{label(r)}</span><button onClick={() => confirm("Delete?") && onDelete(r.id)} className="text-destructive">Delete</button></li>)}
      </ul>
    </div>
  );
}

function SimpleForm({ fields, onSave }: { fields: string[]; onSave: (v: Record<string, string>) => Promise<void> }) {
  const [v, setV] = useState<Record<string, string>>({});
  return (
    <form className="grid gap-2" onSubmit={async (e) => { e.preventDefault(); const clean = Object.fromEntries(Object.entries(v).filter(([, x]) => x.trim())); await onSave(clean); setV({}); }}>
      <p className="font-semibold">Add new</p>
      {fields.map((f) => f === "body" || f === "description" || f === "note"
        ? <textarea key={f} className="field" rows={3} placeholder={f.replace("_", " ")} value={v[f] ?? ""} onChange={(e) => setV({ ...v, [f]: e.target.value })} />
        : <input key={f} className="field" placeholder={f.replace("_", " ")} required={f === "title" || f === "author_name" || f === "recipient" || f === "body"} value={v[f] ?? ""} onChange={(e) => setV({ ...v, [f]: e.target.value })} />)}
      <button className="btn-ink justify-self-start">Save</button>
    </form>
  );
}
