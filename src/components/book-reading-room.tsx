import { Link } from "@tanstack/react-router";
import { BookOpen, Plus, Users } from "lucide-react";
import { DEMO_ONLINE } from "@/lib/demo-pricing";

export function BookReadingRoom() {
  return (
    <section aria-label="Book reading room" className="mt-8 border-y border-border py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="size-5 text-gold" /> Reading room</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="relative flex size-3 shrink-0"><span className="absolute inline-flex size-full rounded-full bg-mint opacity-50 motion-safe:animate-ping" /><span className="relative inline-flex size-3 rounded-full bg-mint" /></span>
            <span className="font-semibold text-mint">{DEMO_ONLINE} online &amp; reading</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Demo</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Simulated club-wide presence · not live activity for this book</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/community" className="btn-glass !px-4 !py-2"><Users className="size-4" /> Community</Link>
          <Link to="/submit" className="btn-ink !px-4 !py-2"><Plus className="size-4" /> Add my book</Link>
        </div>
      </div>
    </section>
  );
}