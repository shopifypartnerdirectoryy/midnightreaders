import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { programs } from "@/lib/mrc-data";
import { demoPrices } from "@/lib/demo-pricing";

export const Route = createFileRoute("/checkout/$slug")({
  loader: ({ params }) => {
    const p = programs.find((x) => x.slug === params.slug);
    const price = demoPrices[params.slug];
    if (!p || !price) throw notFound();
    return { p, price };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Demo checkout — ${loaderData?.p.name ?? "MRC"} | Midnight Readers Club` },
      { name: "description", content: "Practice checkout for Midnight Readers Club programs. No real payment is taken." },
      { property: "og:title", content: `Demo checkout — ${loaderData?.p.name ?? "MRC"}` },
      { property: "og:description", content: "Practice checkout. No real payment is taken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { p, price } = Route.useLoaderData();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <section className="mx-auto max-w-xl px-4 py-14">
      <div className="glass-lg rounded-[2rem] p-8">
        <span className="chip">Demo checkout · no real money</span>
        <h1 className="mt-4 font-serif text-3xl font-semibold">{p.name}</h1>
        <p className="mt-1 text-muted-foreground">{p.short}</p>
        <p className="mt-5 font-serif text-4xl font-semibold text-gold">{price.price} <span className="text-base font-normal text-muted-foreground">{price.period}</span></p>

        {done ? (
          <div className="glass mt-8 rounded-2xl p-6 text-center">
            <p className="font-serif text-2xl font-semibold">You're in! ☾</p>
            <p className="mt-2 text-sm text-muted-foreground">This was a practice payment — nothing was charged.</p>
            <Link to="/programs/$slug" params={{ slug: p.slug }} className="btn-ink mt-5">Back to {p.name}</Link>
          </div>
        ) : (
          <form className="mt-8 grid gap-3" onSubmit={(e) => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); setDone(true); }, 900); }}>
            <input required placeholder="Name on card" className="glass rounded-xl px-4 py-3 text-sm" />
            <input required placeholder="Card number (try 4242 4242 4242 4242)" inputMode="numeric" className="glass rounded-xl px-4 py-3 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="MM / YY" className="glass rounded-xl px-4 py-3 text-sm" />
              <input required placeholder="CVC" className="glass rounded-xl px-4 py-3 text-sm" />
            </div>
            <button disabled={busy} className="btn-ink mt-2">{busy ? "Processing…" : `Pay ${price.price} (demo)`}</button>
            <p className="text-center text-xs text-muted-foreground">Practice only. Card details are not saved or sent anywhere.</p>
          </form>
        )}
      </div>
    </section>
  );
}
