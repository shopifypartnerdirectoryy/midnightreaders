import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Midnight Readers Club" },
      { name: "description", content: "The MRC Community: reader profiles, discussions, groups, buddy reads, reviews and more — coming soon." },
      { property: "og:title", content: "The MRC Community" },
      { property: "og:description", content: "Where Midnight Readers actually meet. Coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Community,
});

const features = ["Reader profiles", "Discussions", "Groups", "Buddy reads", "Reviews", "Polls", "Reading goals", "Community challenges"];

function Community() {
  const { user } = useAuth();
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <span className="chip">Community</span>
      <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Where Midnight Readers meet</h1>
      <p className="mt-4 text-lg text-muted-foreground">The MRC Community is a full reader platform being built as its own module. Your MRC account, shelf, reading goal and books will carry straight over.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => <div key={f} className="glass rounded-2xl p-4 text-sm font-semibold">{f}</div>)}
      </div>
      <div className="glass-lg mt-8 rounded-[2rem] p-8">
        <p className="font-serif text-2xl font-semibold">Opening soon</p>
        <p className="mt-2 text-muted-foreground">Members get notified in their dashboard the moment it opens.</p>
        {user ? <Link to="/dashboard" className="btn-ink mt-5">Go to My MRC</Link> : <Link to="/auth" className="btn-ink mt-5">Create your account</Link>}
      </div>
    </section>
  );
}
