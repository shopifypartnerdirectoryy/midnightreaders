import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, MessageCircle, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type RoomComment = { id: string; author_name: string; body: string; chapter: number; created_at: string };
type RoomStats = { readers: number; comments: number; finished: number };

export function BookReadingRoom({ bookId, submissionPreview = false }: { bookId: string; submissionPreview?: boolean }) {
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [stats, setStats] = useState<RoomStats>({ readers: 0, comments: 0, finished: 0 });
  const [recent, setRecent] = useState<RoomComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [{ data: statsData }, commentResult] = await Promise.all([
        supabase.rpc("book_stats"),
        user ? supabase.from("book_comments").select("id,author_name,body,chapter,created_at").eq("book_id", bookId).order("created_at", { ascending: false }).limit(5) : Promise.resolve({ data: null }),
      ]);
      const roomStat = (statsData ?? []).find((row) => row.book_id === bookId);
      if (active) {
        setStats({ readers: Number(roomStat?.readers ?? 0), comments: Number(roomStat?.comments ?? 0), finished: Number(roomStat?.finished ?? 0) });
        setRecent((commentResult.data ?? []) as RoomComment[]);
      }
      if (user) {
        const { data: member } = await supabase.from("community_members").select("user_id").eq("user_id", user.id).maybeSingle();
        if (active) setJoined(Boolean(member));
      } else if (active) setJoined(false);
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [bookId, user]);

  const completion = stats.readers ? Math.round((stats.finished / stats.readers) * 100) : 0;
  return (
    <section aria-label="Book reading room" className="mt-8 border-y border-border py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><BookOpen className="size-5 text-gold" /> Reading room</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">A dedicated place to follow reading progress, discuss chapters and read alongside the community.</p>
          {submissionPreview && <p className="mt-3 max-w-md text-sm text-muted-foreground">A preview of the reading-room experience. Publication awaits editorial approval.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/community" className="btn-glass !px-4 !py-2"><Users className="size-4" /> Community</Link>
          <Link to="/submit" className="btn-ink !px-4 !py-2"><Plus className="size-4" /> Add my book</Link>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3"><Users className="size-4 text-gold"/><p className="mt-2 text-xl font-semibold">{stats.readers}</p><p className="text-xs text-muted-foreground">Readers tracked</p></div>
        <div className="glass rounded-xl p-3"><MessageCircle className="size-4 text-gold"/><p className="mt-2 text-xl font-semibold">{stats.comments}</p><p className="text-xs text-muted-foreground">Chapter comments</p></div>
        <div className="glass rounded-xl p-3"><BookOpen className="size-4 text-gold"/><p className="mt-2 text-xl font-semibold">{completion}%</p><p className="text-xs text-muted-foreground">Completion</p></div>
      </div>
      <div className="mt-5 rounded-2xl bg-muted/40 p-4">
        <h3 className="font-serif text-lg font-semibold">Recent chapter discussion</h3>
        {loading ? <p className="mt-3 text-sm text-muted-foreground">Loading room activity…</p> : !user ? <p className="mt-3 text-sm text-muted-foreground"><Link to="/auth" className="text-accent">Sign in</Link> to participate in discussions.</p> : !joined ? <p className="mt-3 text-sm text-muted-foreground">Community access is needed to view and contribute to the chapter discussion. <Link to="/community/join" className="text-accent">Request access</Link>.</p> : recent.length ? <ul className="mt-3 grid gap-3">{recent.map((comment) => <li key={comment.id} className="rounded-xl border border-border bg-background/50 p-3"><p className="text-xs text-muted-foreground">{comment.author_name} · Chapter {comment.chapter} · {new Date(comment.created_at).toLocaleDateString()}</p><p className="mt-2 line-clamp-3 text-sm">{comment.body}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No chapter comments yet. Be the first to start a discussion from the chapter threads below.</p>}
      </div>
    </section>
  );
}
