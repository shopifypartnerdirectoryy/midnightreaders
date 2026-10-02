import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function InquiryForm({ program, cta = "Send", dark }: { program: string; cta?: string; dark?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy");
    const { error } = await supabase.from("inquiries").insert({ program, name: name.trim(), email: email.trim(), message: message.trim() || null });
    setState(error ? "error" : "done");
  }

  if (state === "done") return <p className={`text-sm font-semibold ${dark ? "text-gold" : "text-accent"}`}>Thanks — we'll be in touch by email.</p>;
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <input className="field text-foreground" placeholder="Name" required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
      <input className="field text-foreground" type="email" placeholder="Email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea className="field text-foreground sm:col-span-2" rows={3} placeholder="Message (optional)" maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />
      <button disabled={state === "busy"} className={`${dark ? "btn-light" : "btn-ink"} justify-self-start`}>{cta}</button>
      {state === "error" && <p className="text-sm text-destructive sm:col-span-2">Something went wrong. Please try again.</p>}
    </form>
  );
}
