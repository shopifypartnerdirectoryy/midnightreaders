import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";

const map: Record<string, string> = { "asset:cover-1": cover1, "asset:cover-2": cover2, "asset:cover-3": cover3 };
export const coverSrc = (url: string | null) => (url ? map[url] ?? url : null);
