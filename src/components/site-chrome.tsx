import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const legal: [string, string][] = [
  ["terms", "Terms"], ["privacy", "Privacy"], ["challenge-rules", "Challenge Rules"], ["author-submissions", "Submission Terms"],
  ["paid-programs", "Paid Programs"], ["refunds", "Refunds"], ["author-services", "Author Services Terms"], ["community-guidelines", "Community Guidelines"],
];

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  return (
    <div className="sticky top-4 z-30 px-4">
      <header className="glass mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-mint">☾</span>
          <span className="font-serif text-lg font-semibold tracking-tight">Midnight Readers Club</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          <Link to="/programs" className="hover:text-foreground">Programs</Link>
          <Link to="/books" className="hover:text-foreground">Books</Link>
          <Link to="/spikes" className="hover:text-foreground">Spikes</Link>
          <Link to="/awards" className="hover:text-foreground">Awards</Link>
          <Link to="/programs/$slug" params={{ slug: "author-services" }} className="hover:text-foreground">Authors</Link>
          {isAdmin && <Link to="/admin" className="hover:text-foreground">Admin</Link>}
        </nav>
        {user
          ? <Link to="/dashboard" className="btn-ink !px-5 !py-2.5">My MRC</Link>
          : <Link to="/auth" className="btn-ink !px-5 !py-2.5">Join the club</Link>}
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10">
      <div className="glass rounded-2xl px-6 py-5 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-serif font-semibold text-foreground">☾ Midnight Readers Club</span>
          <span>Reading for Growth · @midnightreadershq</span>
          <span className="flex gap-4"><Link to="/about">About</Link><Link to="/contact">Contact</Link></span>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {legal.map(([s, l]) => <Link key={s} to="/legal/$slug" params={{ slug: s }} className="hover:text-foreground">{l}</Link>)}
        </div>
      </div>
    </footer>
  );
}
