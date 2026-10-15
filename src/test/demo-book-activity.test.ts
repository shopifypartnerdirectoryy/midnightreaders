import { describe, expect, it } from "vitest";
import { demoBookActivity } from "@/lib/demo-book-activity";

describe("simulated book activity", () => {
  it("starts with 5,000 checking the book", () => {
    expect(demoBookActivity("book-a", 0)).toEqual({ count: 5000, label: "currently checking this book" });
  });
  it("moves to 1,000+ reading after the first interval", () => {
    const activity = demoBookActivity("book-a", 1);
    expect(activity.count).toBeGreaterThanOrEqual(1000);
    expect(activity.count).toBeLessThan(1200);
    expect(activity.label).toBe("currently reading this book");
  });
  it("keeps rotating rather than stopping after one update", () => {
    expect(demoBookActivity("book-a", 4).count).toBeGreaterThanOrEqual(5000);
    expect(demoBookActivity("book-a", 5)).not.toEqual(demoBookActivity("book-a", 1));
  });
  it("varies subsequent activity by book", () => {
    expect(demoBookActivity("book-a", 1).count).not.toBe(demoBookActivity("book-b", 1).count);
  });
});