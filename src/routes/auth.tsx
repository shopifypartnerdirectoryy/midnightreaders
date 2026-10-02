import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Midnight Readers Club" },
      { name: "description", content: "Sign in or join Midnight Readers Club." },
      { property: "og:title", content: "Join Midnight Readers Club" },
      { property: "og:description", content: "Create your free reader account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { display_name: name } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account.");
      else nav({ to: "/dashboard" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else nav({ to: "/dashboard" });
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { setMsg(r.error.message ?? "Google sign-in failed"); return; }
    if (r.redirected) return;
    nav({ to: "/dashboard" });
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14">
      <div className="glass-lg rounded-[2rem] p-8">
        <h1 className="font-serif text-3xl font-semibold">{mode === "up" ? "Join Midnight Readers Club" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Free reader account. Reading for Growth.</p>
        <button onClick={google} className="btn-glass mt-6 w-full justify-center">Continue with Google</button>
        <div className="my-5 text-center text-xs text-muted-foreground">or</div>
        <form onSubmit={submit} className="grid gap-3">
          {mode === "up" && <input className="field" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />}
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="field" type="password" placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={busy} className="btn-ink justify-center">{mode === "up" ? "Create account" : "Sign in"}</button>
        </form>
        {msg && <p className="mt-4 text-sm text-accent">{msg}</p>}
        <button onClick={() => setMode(mode === "up" ? "in" : "up")} className="mt-5 text-sm font-semibold text-accent">
          {mode === "up" ? "Already a member? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </section>
  );
}
