import { Link } from "@tanstack/react-router";
import { BookOpen, Plus, Users } from "lucide-react";

export function BookReadingRoom({ bookId, submissionPreview = false }: { bookId: string; submissionPreview?: boolean }) {
  return (
    <section aria-label="Book reading room" className="mt-8 border-y border-border py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="size-5 text-gold" /> Reading room</h2>
          {submissionPreview && <p className="mt-3 max-w-md text-sm text-muted-foreground">How your book could appear to our community of 10,000+ members. Publication awaits editorial approval.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/community" className="btn-glass !px-4 !py-2"><Users className="size-4" /> Community</Link>
          <Link to="/submit" className="btn-ink !px-4 !py-2"><Plus className="size-4" /> Add my book</Link>
        </div>
      </div>
    </section>
  );
}