import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/submit")({
  head: () => ({ meta: [{ title: "Submit Your Book — Midnight Readers Club" }, { name: "robots", content: "noindex" }] }),
  component: Submit,
});

const programOptions = ["Book Discovery", "Reading Challenge", "Spotlight Challenges", "Book-to-Film", "Author Services"];

function Submit() {
  const { user } = Route.useRouteContext();
  const [f, setF] = useState({ title: "", author_name: "", genre: "", description: "", cover_url: "", buy_link: "" });
  const [programs, setPrograms] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy");
    const { error } = await supabase.from("book_submissions").insert({ ...f, user_id: user.id, programs, cover_url: f.cover_url || null, buy_link: f.buy_link || null });
    setState(error ? "error" : "done");
  }

  if (state === "done") return (
    <section className="mx-auto max-w-2xl px-4 py-14"><div className="glass-lg rounded-[2rem] p-8">
      <h1 className="font-serif text-3xl font-semibold">Submission received</h1>
      <p className="mt-2 text-muted-foreground">Our team will review it. Track its status on your dashboard.</p>
      <Link to="/dashboard" className="btn-ink mt-6">Go to dashboard</Link>
    </div></section>
  );

  return (
    <section className="mx-auto max-w-2xl px-4 py-14">
      <form onSubmit={submit} className="glass-lg grid gap-3 rounded-[2rem] p-8">
        <h1 className="font-serif text-4xl font-semibold">Submit your book</h1>
        <input className="field" placeholder="Book title" required maxLength={200} value={f.title} onChange={set("title")} />
        <input className="field" placeholder="Author name" required maxLength={200} value={f.author_name} onChange={set("author_name")} />
        <input className="field" placeholder="Genre" maxLength={100} value={f.genre} onChange={set("genre")} />
        <textarea className="field" rows={4} placeholder="Short description" maxLength={2000} value={f.description} onChange={set("description")} />
        <input className="field" type="url" placeholder="Cover image link (optional)" value={f.cover_url} onChange={set("cover_url")} />
        <input className="field" type="url" placeholder="Where to buy (optional)" value={f.buy_link} onChange={set("buy_link")} />
        <p className="mt-2 text-sm font-semibold">Programs you're interested in</p>
        <div className="flex flex-wrap gap-2">
          {programOptions.map((p) => (
            <button type="button" key={p} onClick={() => setPrograms(programs.includes(p) ? programs.filter((x) => x !== p) : [...programs, p])}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${programs.includes(p) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{p}</button>
          ))}
        </div>
        <label className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>I agree to the <Link to="/legal/$slug" params={{ slug: "author-submissions" }} className="text-accent underline">Author Submission Terms</Link>.</span>
        </label>
        <button disabled={!agree || state === "busy"} className="btn-ink mt-2 justify-self-start disabled:opacity-50">Submit book</button>
        {state === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
      </form>
    </section>
  );
}
