import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock3, FileUp, IdCard, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  communityApplicationSchema,
  normalizeExistingMemberId,
  validatePaymentProof,
} from "@/lib/community-access";

export const Route = createFileRoute("/_authenticated/community/join")({
  head: () => ({
    meta: [
      { title: "Request Community Access — Midnight Readers Club" },
      { name: "description", content: "Apply to join The Midnight Readers with payment proof or your existing MRC member ID." },
      { property: "og:title", content: "Request Community Access — Midnight Readers Club" },
      { property: "og:description", content: "Apply for reviewed access to The Midnight Readers community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityJoin,
});

type Application = Tables<"community_applications">;
type Membership = Pick<Tables<"community_members">, "user_id" | "member_id">;

function CommunityJoin() {
  const { user } = Route.useRouteContext();
  const [fullName, setFullName] = useState(() => String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? ""));
  const [email, setEmail] = useState(user.email ?? "");
  const [applicationType, setApplicationType] = useState<"payment" | "existing">("payment");
  const [existingMemberId, setExistingMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [latest, setLatest] = useState<Application | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void Promise.all([
      supabase.from("community_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("community_members").select("user_id,member_id").eq("user_id", user.id).maybeSingle(),
    ]).then(([applicationResult, memberResult]) => {
      setLatest(applicationResult.data);
      setMembership(memberResult.data);
      setLoading(false);
    });
  }, [user.id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = communityApplicationSchema.safeParse({ fullName, email, applicationType, existingMemberId, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your application details.");
      return;
    }
    if (applicationType === "payment" && !proof) {
      setError("Choose your payment receipt to continue.");
      return;
    }
    if (proof) {
      const fileError = validatePaymentProof(proof);
      if (fileError) { setError(fileError); return; }
    }

    setBusy(true);
    let uploadedPath: string | null = null;
    if (applicationType === "payment" && proof) {
      const extension = proof.type === "application/pdf" ? "pdf" : proof.type === "image/png" ? "png" : "jpg";
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("community-payment-proofs").upload(uploadedPath, proof, {
        contentType: proof.type,
        upsert: false,
      });
      if (uploadError) {
        setError("We couldn’t upload your receipt. Check the file and try again.");
        setBusy(false);
        return;
      }
    }

    const { data, error: insertError } = await supabase.from("community_applications").insert({
      user_id: user.id,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      application_type: applicationType,
      payment_proof_path: uploadedPath,
      existing_member_id: applicationType === "existing" ? normalizeExistingMemberId(existingMemberId) : null,
      message: parsed.data.message || null,
    }).select("*").single();

    if (insertError || !data) {
      if (uploadedPath) await supabase.storage.from("community-payment-proofs").remove([uploadedPath]);
      setError("We couldn’t send your application. You may already have one waiting for review; otherwise, please try again.");
    } else {
      setLatest(data);
      setProof(null);
    }
    setBusy(false);
  }

  async function copyMemberId(id: string) {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return <section className="mx-auto max-w-2xl px-4 py-20 text-muted-foreground">Loading your community application…</section>;

  const approvedId = membership?.member_id ?? (latest?.status === "approved" ? latest.member_id : null);
  if (membership || latest?.status === "approved") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="glass-lg rounded-[2rem] p-8 text-center sm:p-10">
          <CheckCircle2 className="mx-auto size-12 text-mint" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-mint">Access approved</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Welcome to The Midnight Readers</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Your community access is active. Keep your distinctive member ID somewhere safe.</p>
          {approvedId ? (
            <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-gold/40 bg-muted p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your MRC member ID</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-gold">{approvedId}</p>
              <button onClick={() => void copyMemberId(approvedId)} className="btn-glass mt-4 !py-2">{copied ? "Copied" : "Copy ID"}</button>
            </div>
          ) : <p className="mt-5 text-sm text-muted-foreground">Your membership predates MRC member IDs, so no ID is attached yet.</p>}
          <Link to="/community" className="btn-ink mt-7">Enter the community</Link>
        </div>
      </section>
    );
  }

  if (latest?.status === "pending") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="glass-lg rounded-[2rem] p-8 text-center sm:p-10">
          <Clock3 className="mx-auto size-12 text-gold" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Application pending</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Your request is with our team</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">We’ll review your {latest.application_type === "payment" ? "payment proof" : "existing member ID"}. You’ll receive an in-app notification when a decision is made.</p>
          <p className="mt-5 text-xs text-muted-foreground">Submitted {new Date(latest.created_at).toLocaleString()}</p>
          <Link to="/community" className="btn-glass mt-7"><ArrowLeft /> Back to community</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/community" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to community</Link>
      <div className="glass-lg rounded-[2rem] p-6 sm:p-9">
        <span className="chip"><ShieldCheck className="mr-1.5 size-3.5" /> Reviewed access</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Request to join The Midnight Readers</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">Choose one route: upload proof of a genuine membership payment made outside this website, or enter the MRC ID you already hold. An admin reviews every request before access is granted.</p>

        {latest?.status === "rejected" && (
          <div role="status" className="mt-6 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div><p className="font-semibold">Your previous request wasn’t approved</p>{latest.admin_note && <p className="mt-1 text-muted-foreground">{latest.admin_note}</p>}<p className="mt-1 text-muted-foreground">You can submit a corrected application below.</p></div>
          </div>
        )}

        <form onSubmit={submit} className="mt-7 grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Full name<input className="field" autoComplete="name" required minLength={2} maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
            <label className="grid gap-2 text-sm font-semibold">Email<input className="field" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          </div>

          <div role="radiogroup" aria-label="Application route" className="grid gap-3 sm:grid-cols-2">
            <button type="button" role="radio" aria-checked={applicationType === "payment"} onClick={() => setApplicationType("payment")} className={`rounded-2xl border p-4 text-left ${applicationType === "payment" ? "border-gold bg-gold/10" : "border-input bg-muted"}`}>
              <FileUp className="size-5 text-gold" /><span className="mt-3 block font-semibold">New membership</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Upload a real external-payment receipt.</span>
            </button>
            <button type="button" role="radio" aria-checked={applicationType === "existing"} onClick={() => setApplicationType("existing")} className={`rounded-2xl border p-4 text-left ${applicationType === "existing" ? "border-gold bg-gold/10" : "border-input bg-muted"}`}>
              <IdCard className="size-5 text-gold" /><span className="mt-3 block font-semibold">I already have an ID</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Ask us to verify and link your existing ID.</span>
            </button>
          </div>

          {applicationType === "payment" ? (
            <label className="grid gap-2 text-sm font-semibold">Payment proof
              <input key="payment-proof" className="field file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground" type="file" accept="image/jpeg,image/png,application/pdf" required onChange={(event) => setProof(event.target.files?.[0] ?? null)} />
              <span className="text-xs font-normal leading-relaxed text-muted-foreground">JPG, PNG or PDF, up to 5 MB. Upload only the receipt or transaction confirmation—never card numbers, PINs or passwords. This file is private to you and MRC admins.</span>
            </label>
          ) : (
            <label className="grid gap-2 text-sm font-semibold">Existing MRC member ID
              <input className="field font-mono uppercase" required maxLength={36} placeholder="MRC-2026-ABC123" value={existingMemberId} onChange={(event) => setExistingMemberId(event.target.value)} />
              <span className="text-xs font-normal text-muted-foreground">The admin will verify this ID before linking it to your account.</span>
            </label>
          )}

          <label className="grid gap-2 text-sm font-semibold">Note for the review team <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea className="field" rows={4} maxLength={1000} placeholder="Payment reference, community chapter, or anything that helps us verify your request" value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>

          {error && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button disabled={busy} className="btn-ink justify-center disabled:opacity-50">{busy ? "Sending securely…" : "Submit access request"}</button>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-mint" />New members receive a unique MRC ID after approval. Existing verified IDs stay the same.</p>
        </form>
      </div>
    </section>
  );
}
