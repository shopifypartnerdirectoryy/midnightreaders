import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { programs, toneChip } from "@/lib/mrc-data";
import { InquiryForm } from "@/components/inquiry-form";

export const Route = createFileRoute("/programs/$slug")({
  loader: ({ params }) => {
    const program = programs.find((p) => p.slug === params.slug);
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.program.name} — Midnight Readers Club`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.program.short },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.program.short },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-semibold">Program not found</h1>
      <Link to="/programs" className="btn-ink mt-6">All programs</Link>
    </div>
  ),
  component: ProgramPage,
});

function ProgramPage() {
  const { program: p } = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className={`${p.dark ? "glass-ink" : "glass-lg"} rounded-[2rem] p-8 md:p-12`}>
        <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneChip[p.tone]}`}>{p.access}</div>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">{p.name}</h1>
        <p className={`mt-4 text-lg leading-relaxed ${p.dark ? "opacity-80" : "text-muted-foreground"}`}>{p.intro}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {p.points.map((pt) => (
            <li key={pt} className={`${p.dark ? "border border-border/20" : "glass"} rounded-xl p-4 text-sm`}>{pt}</li>
          ))}
        </ul>
        <div className="mt-10">
          {p.slug === "reading-challenge" ? (
            <Link to="/dashboard" className="btn-ink">{p.cta}</Link>
          ) : p.slug === "midnight-spikes" ? (
            <Link to="/spikes" className="btn-ink">{p.cta}</Link>
          ) : (
            <>
              {p.slug === "author-services" && (
                <Link to="/submit" className="btn-ink mb-6">Submit your book</Link>
              )}
              <h2 className="font-serif text-xl font-semibold">{p.slug === "author-services" ? "Ask about a service" : "Register your interest"}</h2>
              <p className={`mb-4 mt-1 text-sm ${p.dark ? "opacity-70" : "text-muted-foreground"}`}>
                {p.access === "For authors" ? "Tell us about your book and which service you need." : "Online payment opens soon — leave your details and we'll email you first."}
              </p>
              <InquiryForm program={p.slug} cta={p.cta} dark={p.dark} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
