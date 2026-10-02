import { createFileRoute, Link, notFound } from "@tanstack/react-router";

const pages: Record<string, { title: string; body: string[] }> = {
  terms: { title: "Terms of Use", body: ["By using Midnight Readers Club you agree to use the platform respectfully and lawfully.", "MRC may update programs, features and these terms; material changes will be announced on the site."] },
  privacy: { title: "Privacy Policy", body: ["We collect only what we need to run your account and programs: your email, display name and reading activity.", "We never sell your personal data. You can ask us to delete your account at any time."] },
  "challenge-rules": { title: "Challenge Rules", body: ["The 2026 Reading Challenge runs August 1, 2026 to August 31, 2027.", "Participation is free. Progress must reflect genuine reading. Recognition is decided editorially."] },
  "author-submissions": { title: "Author Submission Terms", body: ["Submitting a book does not guarantee a feature, award or placement.", "You confirm you hold the rights to the material and images you submit."] },
  "paid-programs": { title: "Paid Program Terms", body: ["Each paid program lists its fee, dates, eligibility and rules before you join.", "Paying for a program never guarantees recognition or awards."] },
  refunds: { title: "Refund Policy", body: ["Refund eligibility is listed on each paid program and service before purchase.", "Contact us with your order details to request a refund."] },
  "author-services": { title: "Author Services Terms", body: ["All paid promotion is clearly labelled as promotion.", "Services describe deliverables, not guaranteed sales, reviews or rankings."] },
  "community-guidelines": { title: "Community Guidelines", body: ["Be kind, stay on topic and respect authors and readers.", "No spam, harassment, fake reviews or undisclosed promotion."] },
};

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const page = pages[params.slug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => loaderData ? {
    meta: [
      { title: `${loaderData.page.title} — Midnight Readers Club` },
      { name: "description", content: loaderData.page.body[0] },
      { property: "og:title", content: `${loaderData.page.title} — Midnight Readers Club` },
      { property: "og:description", content: loaderData.page.body[0] },
    ],
  } : { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => <div className="py-20 text-center"><Link to="/" className="btn-ink">Go home</Link></div>,
  component: Legal,
});

export const legalLinks = Object.entries(pages).map(([slug, p]) => ({ slug, title: p.title }));

function Legal() {
  const { page } = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <div className="glass-lg rounded-[2rem] p-8 md:p-12">
        <h1 className="font-serif text-4xl font-semibold">{page.title}</h1>
        {page.body.map((b) => <p key={b} className="mt-4 leading-relaxed text-muted-foreground">{b}</p>)}
        <p className="mt-8 text-xs text-muted-foreground">Starter text — have it reviewed before launch.</p>
      </div>
    </section>
  );
}
