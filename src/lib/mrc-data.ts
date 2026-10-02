import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";

export type Program = {
  slug: string;
  name: string;
  tag: string;
  tone: "neutral" | "mint" | "gold" | "lav";
  access: "Free" | "Premium membership" | "Paid program" | "For authors";
  short: string;
  intro: string;
  points: string[];
  cta: string;
  dark?: boolean;
};

export const programs: Program[] = [
  {
    slug: "reading-challenge",
    name: "2026 Reading Challenge",
    tag: "Flagship",
    tone: "neutral",
    access: "Free",
    short: "A year-long reading journey from August 1, 2026 to August 31, 2027.",
    intro:
      "The MRC 2026 Reading Challenge runs from August 1, 2026 to August 31, 2027. Set a goal, follow featured books, take part in reader activities and grow as a reader across the year.",
    points: [
      "Set a personal reading goal and track progress",
      "Featured books and monthly reader activities",
      "Recognition for consistent, thoughtful participation",
      "Clear rules and published important dates",
    ],
    cta: "Join the Challenge",
  },
  {
    slug: "midnight-spikes",
    name: "Midnight Spikes",
    tag: "Free",
    tone: "mint",
    access: "Free",
    short: "Short, sharp literary drops — prompts, picks and conversations after dark.",
    intro:
      "Midnight Spikes are short-form literary moments: reading prompts, quick picks, mini-reviews and conversation starters, released regularly for every reader.",
    points: [
      "Fresh drops across genres and moods",
      "Browse by category",
      "Save the ones you want to read",
      "Share with your reading circle",
    ],
    cta: "Explore Midnight Spikes",
  },
  {
    slug: "after-dark",
    name: "After Dark",
    tag: "Premium",
    tone: "gold",
    access: "Premium membership",
    short: "Members-only sessions, deep-dive guides and early access to featured titles.",
    intro:
      "Midnight Readers Club — After Dark is our recurring premium membership for readers who want to go deeper: exclusive content, member sessions and early access.",
    points: [
      "Exclusive deep-dive reading guides",
      "Members-only live sessions",
      "Early access to featured titles and events",
      "Manage or cancel your membership any time",
    ],
    cta: "Enter After Dark",
    dark: true,
  },
  {
    slug: "spotlight-challenges",
    name: "Spotlight Challenges",
    tag: "Paid program",
    tone: "lav",
    access: "Paid program",
    short: "Specialised literary challenges with clear entry details and published rules.",
    intro:
      "MRC Spotlight Challenges are specialised paid literary challenges. Every challenge lists its fee, dates, eligibility, rules and how recognition is decided — up front.",
    points: [
      "Entry fee, dates and eligibility shown clearly",
      "Published rules and judging approach",
      "Recognition decided editorially, never sold",
      "Refund terms available before you join",
    ],
    cta: "View Spotlight Challenges",
  },
  {
    slug: "book-to-film",
    name: "Book-to-Film Challenge",
    tag: "Flagship",
    tone: "neutral",
    access: "Paid program",
    short: "Our flagship adaptation challenge — read the source, explore the screen.",
    intro:
      "The MRC Book-to-Film Challenge celebrates stories that move from page to screen, and the books we believe deserve to.",
    points: [
      "Read source novels and compare adaptations",
      "Discussion guides for every featured title",
      "Author submissions for adaptation-ready books",
      "Transparent selection criteria",
    ],
    cta: "Explore Book-to-Film",
  },
  {
    slug: "author-services",
    name: "Author Services",
    tag: "For authors",
    tone: "neutral",
    access: "For authors",
    short: "Book promotion, TikTok features, Q&As, reader campaigns and launch support.",
    intro:
      "Authors can submit books, join eligible programs and use our promotional services. Paid promotion is always clearly labelled and kept separate from editorial recognition.",
    points: [
      "Book Promotion and Social Media Promotion",
      "TikTok Book Features",
      "Author Q&As and Reader Campaigns",
      "Book Launch Support and Visibility Programs",
    ],
    cta: "Explore Author Opportunities",
  },
];

export const books = [
  { cover: cover1, title: "The Lantern Hour", author: "Elise Carter", genre: "Literary Fiction", blurb: "A quiet novel about memory, set across one long winter night.", program: "Reading Challenge" },
  { cover: cover2, title: "Salt & Signal", author: "Elise Marin", genre: "Contemporary", blurb: "Interlinked stories from coastal towns that never sleep.", program: "Book-to-Film" },
  { cover: cover3, title: "Ember Field Notes", author: "Elise Marlow", genre: "Essays", blurb: "An essay collection on attention, craft, and slow mornings.", program: "Midnight Spikes" },
];

export const toneChip: Record<Program["tone"], string> = {
  neutral: "bg-muted text-muted-foreground",
  mint: "bg-mint/15 text-mint",
  gold: "bg-gold/20 text-gold",
  lav: "bg-accent/15 text-accent",
};
