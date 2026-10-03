import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { books, programs, toneChip } from "@/lib/mrc-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midnight Readers Club — Reading for Growth" },
      { name: "description", content: "Reading challenges, Midnight Spikes, After Dark membership, book discovery and author programs from Midnight Readers Club." },
      { property: "og:title", content: "Midnight Readers Club — Reading for Growth" },
      { property: "og:description", content: "Discover more. Go deeper. Challenges, book discovery and author programs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-8">
        <div className="glass-lg relative overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-mint/25 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="chip">The 2026 Reading Challenge starts Aug 1</span>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
                Reading for Growth.<br />Discover More. <span className="italic text-accent">Go Deeper.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Midnight Readers Club connects readers, books and authors through challenges, discovery and literary entertainment.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/auth" className="btn-ink">Join Midnight Readers Club</Link>
                <Link to="/programs/$slug" params={{ slug: "reading-challenge" }} className="btn-glass">Explore the Reading Challenge</Link>
                <Link to="/spikes" className="btn-glass">Discover Midnight Spikes</Link>
              </div>
              <div className="mt-6 flex gap-6 text-sm font-semibold">
                <Link to="/programs/$slug" params={{ slug: "author-services" }} className="text-accent hover:underline">For Authors →</Link>
                <Link to="/programs/$slug" params={{ slug: "after-dark" }} className="text-accent hover:underline">Enter After Dark →</Link>
              </div>
            </div>
            <div className="relative">
              <img src={hero} alt="Open book and tea by lamplight at midnight" width={1088} height={1200} className="aspect-[4/5] w-full rounded-3xl object-cover" />
              <div className="glass absolute -bottom-5 -left-5 w-48 rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-mint">Challenge window</p>
                <p className="font-serif text-2xl font-semibold">13 months</p>
                <p className="mt-1 text-xs text-muted-foreground">Aug 1, 2026 – Aug 31, 2027</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="glass grid gap-6 rounded-[2rem] p-8 md:grid-cols-[1fr_1.4fr] md:p-10">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">What is Midnight Readers Club?</h2>
          <p className="leading-relaxed text-muted-foreground">
            An independent platform centred on reading, discovery and growth. We bring together meaningful engagement, author discovery, book exploration, literary challenges and storytelling — a home for readers who want more from every book.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">Programs</h2>
          <Link to="/programs" className="text-sm font-semibold text-accent hover:underline">View all →</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.slug} to="/programs/$slug" params={{ slug: p.slug }}
              className={`${p.dark ? "glass-ink" : "glass"} rounded-2xl p-6 transition hover:-translate-y-1`}>
              <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneChip[p.tone]}`}>{p.tag}</div>
              <h3 className="font-serif text-xl font-semibold">{p.name}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${p.dark ? "opacity-75" : "text-muted-foreground"}`}>{p.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-serif text-3xl font-semibold tracking-tight">Featured books</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <article key={b.title} className="glass overflow-hidden rounded-2xl">
              <img src={b.cover} alt={`${b.title} cover`} loading="lazy" width={704} height={944} className="aspect-[3/4] w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">{b.program}</span>
                <h3 className="mt-2 font-serif text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.author} · {b.genre}</p>
                <p className="mt-2 text-sm text-muted-foreground">{b.blurb}</p>
                <span className="mt-3 inline-block text-sm font-semibold">View Book →</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="glass-lg grid gap-6 rounded-[2rem] p-8 md:grid-cols-[1fr_1.2fr] md:p-10">
          <div>
            <span className="chip">Reading Challenge</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight">August 1, 2026 – August 31, 2027</h2>
            <p className="mt-3 text-muted-foreground">Set your goal, read featured books, join reader activities and earn recognition along the way.</p>
            <Link to="/programs/$slug" params={{ slug: "reading-challenge" }} className="btn-ink mt-6">Join the Challenge</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["text-mint", "Participate", "Log books, update progress, join monthly prompts."],
              ["text-gold", "Recognition", "Milestones and highlights for engaged readers."],
              ["text-accent", "Midnight Spikes", "Short literary drops to keep you reading.", "midnight-spikes"],
              ["text-accent", "For Authors", "Submit books and explore Spotlight & Book-to-Film.", "author-services"],
            ].map(([c, t, d, s]) => (
              <div key={t} className="glass rounded-2xl p-5">
                <p className={`text-xs font-semibold uppercase tracking-widest ${c}`}>{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                {s && <Link to="/programs/$slug" params={{ slug: s }} className="mt-2 inline-block text-sm font-semibold">Explore →</Link>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 pb-20">
        <div className="glass-ink flex flex-col justify-between gap-6 rounded-[2rem] p-10 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Premium membership</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">After Dark</h2>
            <p className="mt-2 max-w-lg opacity-75">Members-only sessions, deep-dive guides and early access to featured titles.</p>
          </div>
          <Link to="/programs/$slug" params={{ slug: "after-dark" }} className="btn-light">Enter After Dark</Link>
        </div>
      </section>
    </>
  );
}
