/** Sample prices for the demo checkout. Placeholder values — no real payments are taken. */
export const demoPrices: Record<string, { price: string; period: string }> = {
  "after-dark": { price: "$9.99", period: "per month" },
  "spotlight-challenges": { price: "$19", period: "per challenge" },
  "book-to-film": { price: "$49", period: "one-time entry" },
  "author-services": { price: "$149", period: "per package" },
};

/** Preview-only "online now" figure, always shown with a visible Preview label. */
export const DEMO_ONLINE = "9,000+";
