import { describe, it, expect } from "vitest";
import { isSpoiler, completionRate, rankTopBooks, rankChallengeBooks, rankChallengeAuthors, type BookEngagementStat } from "@/lib/book-stats";
import { scoreTrack } from "@/components/track-quiz";

describe("reading rules", () => {
  it("locks comments beyond my chapter", () => {
    expect(isSpoiler(5, 4)).toBe(true);
    expect(isSpoiler(4, 4)).toBe(false);
  });
  it("completion rate is finished / readers", () => {
    expect(completionRate({ book_id: "a", readers: 4, finished: 1, week_activity: 0, comments: 0 })).toBe(25);
  });
  it("ranks by weekly activity", () => {
    const r = rankTopBooks([{ id: "a", title: "A" }, { id: "b", title: "B" }], {
      a: { book_id: "a", readers: 9, finished: 0, week_activity: 1, comments: 0 },
      b: { book_id: "b", readers: 1, finished: 0, week_activity: 5, comments: 0 },
    });
    expect(r[0]?.id).toBe("b");
  });
  it("ranks challenge books by chapter discussion count before other engagement", () => {
    const stat = (book_id: string, challenge_comments: number, engagement_score: number): BookEngagementStat => ({
      book_id, readers: 0, finished: 0, comments: 0, average_rating: 0, rating_count: 0,
      review_count: 0, votes: 50, challenge_comments, challenge_completions: 0,
      challenge_unique_readers: 0, engagement_score,
    });
    const books = [{ id: "votes", title: "Votes First", author_name: "A" }, { id: "talk", title: "Discussion First", author_name: "B" }];
    const ranked = rankChallengeBooks(books, { votes: stat("votes", 1, 1000), talk: stat("talk", 2, 12) });
    expect(ranked[0]?.id).toBe("talk");
  });
  it("combines each author's challenge engagement across their books", () => {
    const stat = (book_id: string, engagement_score: number): BookEngagementStat => ({
      book_id, readers: 0, finished: 0, comments: 0, average_rating: 0, rating_count: 0,
      review_count: 0, votes: 0, challenge_comments: 0, challenge_completions: 0,
      challenge_unique_readers: 0, engagement_score,
    });
    const ranked = rankChallengeAuthors([
      { id: "a1", author_name: "Ada", author_user_id: "ada" },
      { id: "a2", author_name: "Ada", author_user_id: "ada" },
      { id: "b1", author_name: "Bea", author_user_id: "bea" },
    ], { a1: stat("a1", 4), a2: stat("a2", 5), b1: stat("b1", 8) });
    expect(ranked[0]?.name).toBe("Ada");
    expect(ranked[0]?.engagement).toBe(9);
  });
  it("quiz picks the majority track", () => {
    expect(scoreTrack(["owl", "screen", "owl"])).toBe("owl");
  });
});
