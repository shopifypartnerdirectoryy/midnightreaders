import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { programs } from "@/lib/mrc-data";

const questions: { q: string; a: [string, Track][] }[] = [
  { q: "It's midnight. What are you reaching for?", a: [["A dense novel with layers to unpack", "diver"], ["The book behind a film I loved", "screen"], ["Anything that lets me disappear", "owl"]] },
  { q: "After finishing a book you usually…", a: [["Re-read passages and take notes", "diver"], ["Look for the adaptation", "screen"], ["Start the next one immediately", "owl"]] },
  { q: "Your ideal reading pace?", a: [["Slow and deep", "diver"], ["Steady, alongside a watchlist", "screen"], ["Fast, late-night binges", "owl"]] },
];

export type Track = "diver" | "screen" | "owl";
export const trackResult: Record<Track, { name: string; blurb: string; slug: string }> = {
  diver: { name: "The Deep Diver", blurb: "You read to understand. Start with the year-long Reading Challenge and its discussion guides.", slug: "reading-challenge" },
  screen: { name: "The Screen-to-Page Fan", blurb: "Stories that move you on screen started somewhere. Begin with the Book-to-Film Challenge.", slug: "book-to-film" },
  owl: { name: "The Night Owl / Escapist", blurb: "Short, sharp and after dark — Midnight Spikes keep you reading every night.", slug: "midnight-spikes" },
};

/** Majority vote; ties go to the earliest answered track. */
export function scoreTrack(answers: Track[]): Track {
  const c: Record<Track, number> = { diver: 0, screen: 0, owl: 0 };
  answers.forEach((a) => c[a]++);
  return answers.reduce<Track>((best, a) => (c[a] > c[best] ? a : best), answers[0] ?? "diver");
}

export function TrackQuiz() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Track[]>([]);
  const done = answers.length === questions.length;
  const result = done ? trackResult[scoreTrack(answers)] : null;
  const program = result ? programs.find((p) => p.slug === result.slug) : null;

  return (
    <>
      <button onClick={() => { setAnswers([]); setOpen(true); }} className="btn-glass">Find your reading track</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-label="Find your reading track" className="glass-lg w-full max-w-lg rounded-[2rem] p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="chip">30-second quiz</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground">✕</button>
            </div>
            {!done ? (
              <>
                <p className="mt-5 text-xs text-muted-foreground">Question {answers.length + 1} of {questions.length}</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold">{questions[answers.length]!.q}</h2>
                <div className="mt-5 grid gap-2">
                  {questions[answers.length]!.a.map(([label, t]) => (
                    <button key={label} onClick={() => setAnswers([...answers, t])} className="glass rounded-xl px-4 py-3 text-left text-sm hover:-translate-y-0.5 transition">{label}</button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold">Your track</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold">{result!.name}</h2>
                <p className="mt-3 text-muted-foreground">{result!.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/programs/$slug" params={{ slug: result!.slug }} className="btn-ink" onClick={() => setOpen(false)}>Start with {program?.name}</Link>
                  <Link to="/auth" className="btn-glass" onClick={() => setOpen(false)}>Join the club</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
