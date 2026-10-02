import { createFileRoute, Link } from "@tanstack/react-router";
import { programs, toneChip } from "@/lib/mrc-data";

export const Route = createFileRoute("/programs/")({
  head: () => ({
    meta: [
      { title: "Programs — Midnight Readers Club" },
      { name: "description", content: "Free, premium and paid MRC programs: Reading Challenge, Midnight Spikes, After Dark, Spotlight, Book-to-Film and Author Services." },
      { property: "og:title", content: "Programs — Midnight Readers Club" },
      { property: "og:description", content: "Every MRC program, clearly labelled free, premium or paid." },
    ],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <span className="chip">The MRC ecosystem</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Programs</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Each program is clearly marked as free, premium or paid.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <Link key={p.slug} to="/programs/$slug" params={{ slug: p.slug }}
            className={`${p.dark ? "glass-ink" : "glass"} rounded-2xl p-6 transition hover:-translate-y-1`}>
            <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneChip[p.tone]}`}>{p.access}</div>
            <h2 className="font-serif text-xl font-semibold">{p.name}</h2>
            <p className={`mt-2 text-sm ${p.dark ? "opacity-75" : "text-muted-foreground"}`}>{p.short}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
