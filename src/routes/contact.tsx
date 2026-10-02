import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/inquiry-form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Midnight Readers Club" },
      { name: "description", content: "Get in touch with Midnight Readers Club." },
      { property: "og:title", content: "Contact — Midnight Readers Club" },
      { property: "og:description", content: "Questions, partnerships and press." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-2xl px-4 py-14">
      <div className="glass-lg rounded-[2rem] p-8">
        <h1 className="font-serif text-4xl font-semibold">Contact us</h1>
        <p className="mb-6 mt-2 text-muted-foreground">Questions, partnerships or press. Find us at @midnightreadershq.</p>
        <InquiryForm program="contact" />
      </div>
    </section>
  ),
});
