import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <div className="sticky top-4 z-30 px-4">
      <header className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-mint">☾</span>
          <span className="font-serif text-lg font-semibold tracking-tight">Midnight Readers Club</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/programs" className="hover:text-foreground">Programs</Link>
          <Link to="/programs/$slug" params={{ slug: "reading-challenge" }} className="hover:text-foreground">Challenge</Link>
          <Link to="/programs/$slug" params={{ slug: "midnight-spikes" }} className="hover:text-foreground">Spikes</Link>
          <Link to="/programs/$slug" params={{ slug: "author-services" }} className="hover:text-foreground">Authors</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
        </nav>
        <Link to="/programs/$slug" params={{ slug: "reading-challenge" }} className="btn-ink !px-5 !py-2.5">Join the club</Link>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 text-sm text-muted-foreground sm:flex-row">
        <span className="font-serif font-semibold text-foreground">☾ Midnight Readers Club</span>
        <span>Reading for Growth · @midnightreadershq</span>
        <span>© 2026 MRC</span>
      </div>
    </footer>
  );
}
