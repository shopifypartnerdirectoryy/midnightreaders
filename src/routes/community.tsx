import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Crown,
  Flame,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import communityBanner from "@/assets/community-banner.jpg";
import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Midnight Readers Club" },
      { name: "description", content: "Join The Midnight Readers for book-of-the-month discussions, polls, buddy reads, challenges and thoughtful literary conversation." },
      { property: "og:title", content: "The Midnight Readers Community Hub" },
      { property: "og:description", content: "Read together after dark: book-of-the-month discussions, buddy reads and community challenges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Community,
});

type Category = "All" | "Announcements" | "BOTM" | "Buddy Reads";
type Discussion = Pick<Tables<"community_discussions">, "id" | "author_name" | "body" | "category" | "created_at" | "title">;

const editorialDiscussions: Discussion[] = [
  { id: "mrc-welcome", author_name: "MRC Editorial", category: "Announcements", title: "Welcome to our October reading room", body: "The doors are open. Introduce yourself, share what you are reading, and settle in for this month’s conversations.", created_at: "2026-10-05T08:00:00.000Z" },
  { id: "mrc-botm", author_name: "MRC Book Team", category: "BOTM", title: "The Lantern Hour — chapters 1–6", body: "What do you make of the winter-house setting? Spoilers are welcome inside the thread, but please keep titles spoiler-free.", created_at: "2026-10-04T19:30:00.000Z" },
  { id: "mrc-buddy", author_name: "MRC Community Team", category: "Buddy Reads", title: "Weekend readers: find your October reading partner", body: "Share your pace and time zone. We will keep matching open throughout the month.", created_at: "2026-10-03T21:15:00.000Z" },
];

const buddyEditorial = [
  { name: "Amara", initials: "AO", book: "The Lantern Hour", pace: "Steady", availability: "Evenings · GMT+1", match: "94%" },
  { name: "Noah", initials: "NK", book: "Salt & Signal", pace: "Relaxed", availability: "Weekends · GMT", match: "88%" },
  { name: "Ife", initials: "IA", book: "Ember Field Notes", pace: "Quick", availability: "Mornings · GMT+1", match: "82%" },
];

const moderators = [
  { name: "Midnight HQ", role: "Lead moderator", initials: "MH" },
  { name: "The Book Team", role: "BOTM curator", initials: "BT" },
  { name: "Community Desk", role: "Member support", initials: "CD" },
];

const pollOptions = ["The Memory Police", "Small Things Like These", "The Vanishing Half"];
const rules = ["Be thoughtful and generous in discussion.", "Mark spoilers clearly and keep them out of titles.", "No unsolicited promotion or repetitive posting.", "Respect privacy; do not repost member conversations."];

function Community() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [discussions, setDiscussions] = useState<Discussion[]>(editorialDiscussions);
  const [vote, setVote] = useState<string | null>(null);
  const [buddyRequested, setBuddyRequested] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      supabase.from("community_members").select("user_id").eq("user_id", user.id).maybeSingle(),
      supabase.from("community_discussions").select("id,author_name,body,category,created_at,title").order("created_at", { ascending: false }).limit(12),
      supabase.from("community_poll_votes").select("choice").eq("user_id", user.id).eq("poll_key", "november-2026").maybeSingle(),
      supabase.from("community_buddy_requests").select("book_title").eq("user_id", user.id),
    ]).then(([memberResult, discussionResult, voteResult, buddyResult]) => {
      setJoined(Boolean(memberResult.data));
      setDiscussions([...(discussionResult.data ?? []), ...editorialDiscussions]);
      setVote(voteResult.data?.choice ?? null);
      setBuddyRequested((buddyResult.data ?? []).map((item) => item.book_title));
    });
  }, [user]);

  const visibleDiscussions = useMemo(
    () => discussions.filter((item) => category === "All" || item.category === category),
    [category, discussions],
  );

  async function joinGroup() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase.from("community_members").upsert({ user_id: user.id });
    if (error) setNotice("We couldn’t join you just now. Please try again.");
    else { setJoined(true); setNotice("Welcome to The Midnight Readers."); }
  }

  async function castVote(choice: string) {
    if (!user || !joined) { setNotice("Join the group to vote in community polls."); return; }
    const { error } = await supabase.from("community_poll_votes").upsert(
      { user_id: user.id, poll_key: "november-2026", choice },
      { onConflict: "user_id,poll_key" },
    );
    if (!error) { setVote(choice); setNotice("Your November vote is in."); }
  }

  async function requestBuddy(book: string) {
    if (!user || !joined) { setNotice("Join the group to request a buddy read."); return; }
    const { error } = await supabase.from("community_buddy_requests").upsert(
      { user_id: user.id, book_title: book, pace: "Steady", availability: "Evenings · GMT+1" },
      { onConflict: "user_id,book_title" },
    );
    if (!error) { setBuddyRequested((items) => [...new Set([...items, book])]); setNotice("Buddy-read request sent."); }
  }

  return (
    <div className="community-theme mt-[-5.25rem] min-h-screen pb-16 pt-[5.25rem] text-community-foreground">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="relative min-h-[26rem] overflow-hidden rounded-lg border border-community-border">
          <img src={communityBanner} alt="A lamplit midnight library prepared for a book club gathering" width={1536} height={640} className="absolute inset-0 size-full object-cover" />
          <div className="community-banner-shade absolute inset-0" />
          <div className="relative flex min-h-[26rem] flex-col justify-end p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="community-chip"><Users /> Public Group</span>
                  <span className="community-chip"><Circle className="fill-community-mint text-community-mint" /> 10,240 Members</span>
                  <span className="community-chip community-chip-gold"><BookOpen /> Active BOTM</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-community-gold">Midnight Readers Club Community</p>
                <h1 className="mt-2 max-w-3xl font-serif text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">The Midnight Readers</h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-community-muted sm:text-lg">A global reading room for thoughtful conversations, shared discoveries, and books that stay with us.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={joinGroup} disabled={!ready || joined} className="h-11 bg-community-gold px-6 text-community-ink hover:bg-community-gold/90">
                  {joined ? <><Check /> Joined</> : <><Sparkles /> Join Group</>}
                </Button>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" className="h-11 border-community-border bg-community-surface/80 px-6 text-community-foreground hover:bg-community-soft hover:text-community-foreground"><ShieldCheck /> Group Rules</Button></DialogTrigger>
                  <DialogContent className="border-community-border bg-community-ink text-community-foreground">
                    <DialogHeader><DialogTitle className="font-serif text-2xl">The reading room code</DialogTitle><DialogDescription className="text-community-muted">A few principles keep our conversations generous and useful.</DialogDescription></DialogHeader>
                    <ol className="mt-2 grid gap-3">{rules.map((rule, index) => <li key={rule} className="flex gap-3 text-sm"><span className="text-community-gold">0{index + 1}</span><span>{rule}</span></li>)}</ol>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {notice && <div role="status" className="mt-4 flex items-center justify-between border border-community-border bg-community-surface px-4 py-3 text-sm"><span>{notice}</span><Button variant="ghost" size="icon" aria-label="Dismiss message" onClick={() => setNotice("")} className="text-community-muted hover:bg-community-soft hover:text-community-foreground">×</Button></div>}

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList aria-label="Community sections" className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-community-border bg-transparent p-0">
            {["Overview", "Discussions", "BOTM & Polls", "Buddy Reads", "Members"].map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replaceAll(" ", "-").replace("&", "and")} className="rounded-none border-b-2 border-transparent px-4 py-4 text-community-muted data-[state=active]:border-community-gold data-[state=active]:bg-transparent data-[state=active]:text-community-foreground data-[state=active]:shadow-none">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
              <div className="space-y-6">
                <BotmSpotlight onVote={() => setNotice("Open BOTM & Polls to choose the next read.")} />
                <DiscussionFeed category={category} setCategory={setCategory} discussions={visibleDiscussions} joined={joined} onCreated={(discussion) => setDiscussions((items) => [discussion, ...items])} />
                <BuddyMatchmaker requests={buddyRequested} onRequest={requestBuddy} />
              </div>
              <CommunitySidebar />
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-8"><DiscussionFeed category={category} setCategory={setCategory} discussions={visibleDiscussions} joined={joined} onCreated={(discussion) => setDiscussions((items) => [discussion, ...items])} expanded /></TabsContent>
          <TabsContent value="botm-and-polls" className="mt-8"><BotmAndPolls vote={vote} onVote={castVote} /></TabsContent>
          <TabsContent value="buddy-reads" className="mt-8"><BuddyMatchmaker requests={buddyRequested} onRequest={requestBuddy} expanded /></TabsContent>
          <TabsContent value="members" className="mt-8"><MembersDirectory /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-community-gold">{eyebrow}</p><h2 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">{title}</h2></div>{action}</div>;
}

function BotmSpotlight({ onVote }: { onVote: () => void }) {
  return (
    <article className="community-panel overflow-hidden">
      <div className="grid sm:grid-cols-[11rem_1fr]">
        <img src={cover1} alt="The Lantern Hour book cover" width={704} height={944} className="h-full max-h-[22rem] w-full object-cover" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="community-kicker"><Crown /> October Book of the Month</span><span className="text-xs text-community-muted">Discussion closes Oct 31</span></div>
          <h2 className="mt-5 font-serif text-3xl font-semibold">The Lantern Hour</h2>
          <p className="mt-1 text-sm text-community-muted">Elise Carter · Literary Fiction</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-community-muted">A quiet novel about memory, set across one long winter night. This week we’re reading chapters 7–12 and tracing the moments its characters choose silence.</p>
          <div className="mt-6 flex items-center justify-between text-xs"><span className="font-semibold">Community progress</span><span className="text-community-gold">62%</span></div>
          <Progress value={62} className="mt-2 h-2 bg-community-soft [&>div]:bg-community-gold" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-community-purple text-community-foreground hover:bg-community-purple/85"><MessageCircle /> Join discussion</Button>
            <Button onClick={onVote} variant="outline" className="border-community-border bg-transparent text-community-foreground hover:bg-community-soft hover:text-community-foreground">Vote next read <ArrowRight /></Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DiscussionFeed({ category, setCategory, discussions, joined, onCreated, expanded = false }: { category: Category; setCategory: (category: Category) => void; discussions: Discussion[]; joined: boolean; onCreated: (discussion: Discussion) => void; expanded?: boolean }) {
  const shown = expanded ? discussions : discussions.slice(0, 4);
  return (
    <section className="community-panel p-6 sm:p-8">
      <SectionHeading eyebrow="Around the tables" title="Latest discussions" action={<NewTopicDialog joined={joined} onCreated={onCreated} />} />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Filter discussions">
        {(["All", "Announcements", "BOTM", "Buddy Reads"] as Category[]).map((item) => <Button key={item} size="sm" variant="ghost" onClick={() => setCategory(item)} className={category === item ? "bg-community-gold text-community-ink hover:bg-community-gold/90" : "border border-community-border text-community-muted hover:bg-community-soft hover:text-community-foreground"}>{item}</Button>)}
      </div>
      <div className="mt-3 divide-y divide-community-border">
        {shown.map((item, index) => (
          <article key={item.id} className="group flex gap-4 py-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-community-soft text-sm font-semibold text-community-gold">{item.author_name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="community-topic-label">{item.category}</span>{item.author_name.startsWith("MRC") && <span className="flex items-center gap-1 text-[11px] text-community-mint"><ShieldCheck className="size-3" /> Official MRC</span>}</div>
              <h3 className="mt-2 font-semibold group-hover:text-community-gold">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-community-muted">{item.body}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-community-muted"><span>{item.author_name}</span><span>{index * 7 + 12} replies</span><span>{index + 1}h ago</span></div>
            </div>
            <ChevronRight className="mt-5 size-4 shrink-0 text-community-muted" />
          </article>
        ))}
      </div>
    </section>
  );
}

function NewTopicDialog({ joined, onCreated }: { joined: boolean; onCreated: (discussion: Discussion) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "All">>("BOTM");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !joined) { setMessage("Join the group before starting a discussion."); return; }
    setBusy(true);
    const authorName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? "Midnight Reader").slice(0, 60);
    const { data, error } = await supabase.from("community_discussions").insert({
      user_id: user.id,
      author_name: authorName,
      category,
      title: title.trim(),
      body: body.trim(),
    }).select("id,author_name,body,category,created_at,title").single();
    setBusy(false);
    if (error || !data) { setMessage(error?.message ?? "Your topic could not be posted."); return; }
    onCreated(data);
    setTitle(""); setBody(""); setMessage(""); setOpen(false);
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button size="sm" className="bg-community-purple text-community-foreground hover:bg-community-purple/85"><MessageCircle /> New topic</Button></DialogTrigger>
    <DialogContent className="border-community-border bg-community-ink text-community-foreground">
      <DialogHeader><DialogTitle className="font-serif text-2xl">Start a discussion</DialogTitle><DialogDescription className="text-community-muted">Open a thoughtful conversation with the reading room.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="mt-2 grid gap-4">
        <label className="grid gap-1.5 text-sm"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as Exclude<Category, "All">)} className="h-10 border border-community-border bg-community-soft px-3 outline-none focus:border-community-gold"><option>Announcements</option><option>BOTM</option><option>Buddy Reads</option></select></label>
        <label className="grid gap-1.5 text-sm"><span>Topic title</span><input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={140} required className="h-10 border border-community-border bg-community-soft px-3 outline-none focus:border-community-gold" /></label>
        <label className="grid gap-1.5 text-sm"><span>Your opening thought</span><textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={3} maxLength={2000} required rows={5} className="resize-none border border-community-border bg-community-soft p-3 outline-none focus:border-community-gold" /></label>
        {message && <p role="status" className="text-sm text-community-gold">{message}</p>}
        <Button disabled={busy} className="justify-self-start bg-community-gold text-community-ink hover:bg-community-gold/90">{busy ? "Posting…" : "Post topic"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function BuddyMatchmaker({ requests, onRequest, expanded = false }: { requests: string[]; onRequest: (book: string) => void; expanded?: boolean }) {
  const list = expanded ? buddyEditorial : buddyEditorial.slice(0, 2);
  return (
    <section className="community-panel p-6 sm:p-8">
      <SectionHeading eyebrow="Read in company" title="Buddy reading matchmaker" action={<span className="hidden items-center gap-2 text-xs text-community-mint sm:flex"><Circle className="size-2 fill-community-mint" /> 34 readers matching</span>} />
      <p className="mt-2 text-sm text-community-muted">Match by book, reading pace and the times you like to check in.</p>
      <div className={`mt-6 grid gap-3 ${expanded ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}>
        {list.map((buddy) => {
          const requested = requests.includes(buddy.book);
          return <article key={buddy.name} className="border border-community-border bg-community-soft p-4">
            <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-community-purple font-semibold">{buddy.initials}</div><div><h3 className="font-semibold">{buddy.name}</h3><p className="text-xs text-community-mint">{buddy.match} reading match</p></div></div>
            <p className="mt-4 text-sm font-medium">{buddy.book}</p><p className="mt-1 text-xs text-community-muted">{buddy.pace} pace · {buddy.availability}</p>
            <Button onClick={() => onRequest(buddy.book)} disabled={requested} variant="outline" size="sm" className="mt-4 w-full border-community-border bg-transparent text-community-foreground hover:bg-community-purple hover:text-community-foreground">{requested ? <><Check /> Requested</> : <><Users /> Read together</>}</Button>
          </article>;
        })}
      </div>
    </section>
  );
}

function CommunitySidebar() {
  return <aside className="space-y-5">
    <section className="community-panel p-5"><div className="flex items-center gap-2 text-community-gold"><ShieldCheck className="size-4" /><h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Group rules</h2></div><ol className="mt-4 space-y-3">{rules.map((rule, index) => <li key={rule} className="flex gap-3 text-sm text-community-muted"><span className="font-serif text-community-gold">{index + 1}</span><span>{rule}</span></li>)}</ol></section>
    <section className="community-panel p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-xl font-semibold">On our shelves</h2><Link to="/books" className="text-xs text-community-gold">View all</Link></div><div className="mt-4 grid grid-cols-3 gap-2">{[[cover1,"The Lantern Hour"],[cover2,"Salt & Signal"],[cover3,"Ember Field Notes"]].map(([src, title]) => <img key={title} src={src} alt={`${title} cover`} loading="lazy" width={704} height={944} className="aspect-[3/4] w-full object-cover" />)}</div><p className="mt-3 text-xs text-community-muted">Recently added by the MRC Book Team</p></section>
    <section className="community-panel p-5"><div className="flex items-center gap-2 text-community-purple-bright"><Flame className="size-4" /><h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Spikes & Challenges</h2></div><Link to="/spikes" className="mt-4 block border-l-2 border-community-purple pl-3"><p className="font-semibold">A scene that changed everything</p><p className="mt-1 text-xs text-community-muted">Today’s 10-minute reading prompt</p></Link><Link to="/programs/$slug" params={{ slug: "reading-challenge" }} className="mt-4 block border-l-2 border-community-gold pl-3"><p className="font-semibold">2026 Reading Challenge</p><p className="mt-1 text-xs text-community-muted">Set your goal and track your year</p></Link></section>
    <section className="community-panel p-5"><h2 className="font-serif text-xl font-semibold">Moderators online</h2><div className="mt-4 space-y-3">{moderators.map((mod) => <div key={mod.name} className="flex items-center gap-3"><div className="relative grid size-9 place-items-center rounded-full bg-community-soft text-xs font-semibold">{mod.initials}<span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-community-ink bg-community-mint" /></div><div><p className="text-sm font-medium">{mod.name}</p><p className="text-xs text-community-muted">{mod.role}</p></div></div>)}</div></section>
  </aside>;
}

function BotmAndPolls({ vote, onVote }: { vote: string | null; onVote: (choice: string) => void }) {
  return <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><BotmSpotlight onVote={() => document.getElementById("next-poll")?.scrollIntoView({ behavior: "smooth" })} /><section id="next-poll" className="community-panel p-6 sm:p-8"><p className="community-kicker"><Star /> November shortlist</p><h2 className="mt-4 font-serif text-3xl font-semibold">Choose our next read</h2><p className="mt-2 text-sm text-community-muted">Voting closes October 24. One vote per member.</p><div className="mt-6 grid gap-3">{pollOptions.map((option, index) => <Button key={option} onClick={() => onVote(option)} variant="outline" className={`h-auto justify-between border-community-border px-4 py-4 text-left text-community-foreground hover:bg-community-soft hover:text-community-foreground ${vote === option ? "bg-community-soft ring-1 ring-community-gold" : "bg-transparent"}`}><span><span className="block font-serif text-lg">{option}</span><span className="mt-1 block text-xs text-community-muted">{[38,34,28][index]}% of community votes</span></span>{vote === option ? <Check className="text-community-gold" /> : <Circle />}</Button>)}</div></section></div>;
}

function MembersDirectory() {
  const members = [...moderators, { name: "Amara O.", role: "Literary fiction", initials: "AO" }, { name: "Noah K.", role: "Contemporary fiction", initials: "NK" }, { name: "Ife A.", role: "Essays & memoir", initials: "IA" }];
  return <section className="community-panel p-6 sm:p-8"><SectionHeading eyebrow="10,240 readers" title="Members of the reading room" action={<div className="relative hidden sm:block"><Search className="absolute left-3 top-2.5 size-4 text-community-muted" /><input aria-label="Search members" placeholder="Search readers" className="h-9 border border-community-border bg-community-soft pl-9 pr-3 text-sm outline-none focus:border-community-gold" /></div>} /><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{members.map((member) => <article key={member.name} className="flex items-center gap-3 border border-community-border bg-community-soft p-4"><div className="grid size-11 place-items-center rounded-full bg-community-purple font-semibold">{member.initials}</div><div><h3 className="font-semibold">{member.name}</h3><p className="text-xs text-community-muted">{member.role}</p></div></article>)}</div></section>;
}
