import { describe, it, expect } from "vitest";
import { isSpoiler, completionRate, rankTopBooks } from "@/lib/book-stats";
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
    expect(r[0].id).toBe("b");
  });
  it("quiz picks the majority track", () => {
    expect(scoreTrack(["owl", "screen", "owl"])).toBe("owl");
  });
});
