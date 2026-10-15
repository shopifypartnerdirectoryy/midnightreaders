import { Link } from "@tanstack/react-router";
import { BookOpen, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DEMO_ACTIVITY_INTERVAL, demoBookActivity } from "@/lib/demo-book-activity";

export function BookReadingRoom({ bookId, submissionPreview = false }: { bookId: string; submissionPreview?: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    const timer = window.setInterval(() => setTick((previous) => previous + 1), DEMO_ACTIVITY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [bookId]);
  const activity = demoBookActivity(bookId, tick);
  return (
    <section aria-label="Book reading room" className="mt-8 border-y border-border py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="size-5 text-gold" /> Reading room</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm" role="status" aria-live="off" aria-label="Simulated book activity">
            <span className="relative flex size-3 shrink-0"><span className="absolute inline-flex size-full rounded-full bg-mint opacity-50 motion-safe:animate-ping" /><span className="relative inline-flex size-3 rounded-full bg-mint" /></span>
            <span className="font-semibold tabular-nums text-mint">{activity.count.toLocaleString("en-US")} {activity.label}</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Demo</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Simulated activity · not actual viewers or readers</p>
          {submissionPreview && <p className="mt-3 max-w-md text-sm text-muted-foreground">Demo distribution preview: your book in our community of 10,000+ members. Publication awaits editorial approval.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/community" className="btn-glass !px-4 !py-2"><Users className="size-4" /> Community</Link>
          <Link to="/submit" className="btn-ink !px-4 !py-2"><Plus className="size-4" /> Add my book</Link>
        </div>
      </div>
    </section>
  );
}