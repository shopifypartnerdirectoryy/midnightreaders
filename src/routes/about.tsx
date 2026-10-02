import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Midnight Readers Club" },
      { name: "description", content: "Midnight Readers Club is an independent reading, discovery and reader-growth platform." },
      { property: "og:title", content: "About — Midnight Readers Club" },
      { property: "og:description", content: "Who we are and how we keep things transparent." },
    ],
  }),
  component: About,
});

const lines = [
  ["Community participation", "What readers do and share themselves."],
  ["Paid promotional services", "Always labelled as promotion."],
  ["Paid challenges", "Fees, rules and refunds published up front."],
  ["Recognition & editorial", "Decided by MRC, never sold."],
  ["Platform-generated activity", "Content from official MRC accounts is labelled as such."],
];

function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className="glass-lg rounded-[2rem] p-8 md:p-12">
        <span className="chip">About MRC</span>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Reading for Growth</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Midnight Readers Club is an independent reading, book discovery, literary entertainment and reader-growth platform — built to connect genuine readers with books and authors worth their time.
        </p>
        <h2 className="mt-10 font-serif text-2xl font-semibold">How we keep it honest</h2>
        <ul className="mt-4 grid gap-3">
          {lines.map(([t, d]) => (
            <li key={t} className="glass rounded-xl p-4"><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
