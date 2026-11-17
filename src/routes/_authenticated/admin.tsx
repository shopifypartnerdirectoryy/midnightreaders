import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Midnight Readers Club" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const tabs = ["Overview", "Access requests", "Submissions", "Books", "Spikes", "Awards", "Inquiries", "Announcements"] as const;

function Admin() {
  const { isAdmin, ready } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [subs, setSubs] = useState<Tables<"book_submissions">[]>([]);
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [spikes, setSpikes] = useState<Tables<"spikes">[]>([]);
  const [awards, setAwards] = useState<Tables<"awards">[]>([]);
  const [inq, setInq] = useState<Tables<"inquiries">[]>([]);
  const [applications, setApplications] = useState<Tables<"community_applications">[]>([]);
  const [counts, setCounts] = useState({ members: 0, enrolled: 0 });

  async function load() {
    const [a, b, c, d, e, m, en, applicationsResult] = await Promise.all([
      supabase.from("book_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      supabase.from("spikes").select("*").order("created_at", { ascending: false }),
      supabase.from("awards").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("challenge_enrollments").select("user_id", { count: "exact", head: true }),
      supabase.from("community_applications").select("*").order("created_at", { ascending: false }),
    ]);
    setSubs(a.data ?? []); setBooks(b.data ?? []); setSpikes(c.data ?? []); setAwards(d.data ?? []); setInq(e.data ?? []);
    setApplications(applicationsResult.data ?? []);
    setCounts({ members: m.count ?? 0, enrolled: en.count ?? 0 });
  }
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  if (!ready) return null;
  if (!isAdmin) return <div className="mx-auto max-w-md px-4 py-20 text-center"><p className="text-muted-foreground">Admins only.</p><Link to="/dashboard" className="btn-ink mt-4">My dashboard</Link></div>;

  async function reviewApplication(application: Tables<"community_applications">, approve: boolean) {
    const note = approve ? null : prompt("Note for the applicant (optional)");
    const { data, error } = await supabase.rpc("review_community_application", {
      _application_id: application.id,
      _approve: approve,
      ...(!approve && note !== null ? { _admin_note: note } : {}),
    });
    if (error) alert(error.message);
    else if (approve) alert(`Access approved. Member ID: ${data}`);
    void load();
  }

  async function viewPaymentProof(path: string) {
    const { data, error } = await supabase.storage.from("community-payment-proofs").createSignedUrl(path, 300);
    if (error || !data) alert("The receipt could not be opened. Please try again.");
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

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
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[["Members", counts.members], ["In challenge", counts.enrolled], ["Pending access", applications.filter((a) => a.status === "pending").length], ["Pending books", subs.filter((s) => s.status === "pending").length], ["Books", books.length], ["Spikes", spikes.length], ["Inquiries", inq.length]].map(([l, v]) => (
              <div key={l} className="glass rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p><p className="mt-2 font-serif text-3xl font-semibold">{v}</p></div>
            ))}
          </div>
        )}
        {tab === "Access requests" && (
          <div className="grid gap-3">
            {applications.map((application) => (
              <article key={application.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{application.full_name} <span className="font-normal text-muted-foreground">· {application.email}</span></p>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">{application.application_type === "payment" ? "New membership · payment proof" : "Existing member ID"} · {application.status} · {new Date(application.created_at).toLocaleString()}</p>
                    {application.existing_member_id && <p className="mt-3 font-mono text-sm font-semibold text-gold">{application.existing_member_id}</p>}
                    {application.member_id && <p className="mt-2 text-sm">Assigned ID: <span className="font-mono font-semibold text-gold">{application.member_id}</span></p>}
                    {application.message && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{application.message}</p>}
                    {application.admin_note && <p className="mt-2 text-sm text-muted-foreground">Admin note: {application.admin_note}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {application.payment_proof_path && <button onClick={() => void viewPaymentProof(application.payment_proof_path!)} className="btn-glass !py-2">View receipt</button>}
                    {application.status === "pending" && <><button onClick={() => void reviewApplication(application, true)} className="btn-ink !py-2">Approve & issue ID</button><button onClick={() => void reviewApplication(application, false)} className="btn-glass !py-2">Reject</button></>}
                  </div>
                </div>
              </article>
            ))}
            {!applications.length && <p className="text-muted-foreground">No community access requests yet.</p>}
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
        {tab === "Announcements" && (
          <div className="glass max-w-xl rounded-2xl p-5">
            <p className="mb-3 text-sm text-muted-foreground">Sends an in-platform notification to every member. New Spikes notify members automatically.</p>
            <SimpleForm fields={["title", "body", "link"]} onSave={async (v) => { await supabase.from("notifications").insert({ ...v, kind: "announcement", user_id: null } as never); alert("Announcement sent"); }} />
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
