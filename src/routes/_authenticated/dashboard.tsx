import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My MRC — Midnight Readers Club" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type ShelfRow = { id: string; status: string; books: { title: string; author_name: string } | null };
type Sub = { id: string; title: string; status: string; admin_note: string | null };

function Dashboard() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState(12);
  const [shelf, setShelf] = useState<ShelfRow[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);

  async function load() {
    const [p, e, s, b] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase.from("challenge_enrollments").select("goal").eq("user_id", user.id).maybeSingle(),
      supabase.from("shelf").select("id,status,books(title,author_name)").order("updated_at", { ascending: false }),
      supabase.from("book_submissions").select("id,title,status,admin_note").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setName(p.data?.display_name ?? "");
    setGoal(e.data?.goal ?? null);
    setShelf((s.data as ShelfRow[]) ?? []);
    setSubs(b.data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function join() {
    await supabase.from("challenge_enrollments").upsert({ user_id: user.id, goal: goalInput });
    void load();
  }
  async function signOut() { await supabase.auth.signOut(); nav({ to: "/", replace: true }); }

  const read = shelf.filter((s) => s.status === "read").length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="chip">My MRC</span><h1 className="mt-3 font-serif text-4xl font-semibold">Hello, {name || "reader"}</h1></div>
        <button onClick={signOut} className="btn-glass">Sign out</button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="glass-lg rounded-[2rem] p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-mint">2026 Reading Challenge</p>
          {goal ? (
            <>
              <p className="mt-3 font-serif text-3xl font-semibold">{read} / {goal} books</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (read / goal) * 100)}%` }} /></div>
              <p className="mt-3 text-sm text-muted-foreground">Mark books as read in Book Discovery to update progress.</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-muted-foreground">Aug 1, 2026 – Aug 31, 2027. Set your goal to join.</p>
              <div className="mt-4 flex gap-3">
                <input type="number" min={1} max={365} className="field w-28" value={goalInput} onChange={(e) => setGoalInput(Number(e.target.value))} />
                <button onClick={join} className="btn-ink">Join the Challenge</button>
              </div>
            </>
          )}
        </div>

        <div className="glass rounded-[2rem] p-8">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-widest text-accent">My shelf</p><Link to="/books" className="text-sm font-semibold text-accent">Discover →</Link></div>
          <ul className="mt-4 grid gap-2">
            {shelf.map((s) => <li key={s.id} className="flex justify-between text-sm"><span>{s.books?.title} <span className="text-muted-foreground">· {s.books?.author_name}</span></span><span className="text-muted-foreground">{s.status}</span></li>)}
            {!shelf.length && <li className="text-sm text-muted-foreground">Nothing saved yet.</li>}
          </ul>
        </div>

        <div className="glass rounded-[2rem] p-8 md:col-span-2">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-widest text-gold">My book submissions</p><Link to="/submit" className="text-sm font-semibold text-accent">Submit a book →</Link></div>
          <ul className="mt-4 grid gap-2">
            {subs.map((s) => <li key={s.id} className="text-sm"><span className="font-semibold">{s.title}</span> — <span className="capitalize">{s.status}</span>{s.admin_note && <span className="text-muted-foreground"> · {s.admin_note}</span>}</li>)}
            {!subs.length && <li className="text-sm text-muted-foreground">Authors can submit books for MRC programs.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
