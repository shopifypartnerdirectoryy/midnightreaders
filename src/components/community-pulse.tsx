import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_ONLINE } from "@/lib/demo-pricing";

/** Headline community stat: the club's stated reach, floored at 10,000+ members. */
export function CommunityPulse() {
  const [members, setMembers] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("member_count").then(({ data }) => setMembers(Number(data ?? 0)));
  }, []);

  const count = members !== null && members > 10000 ? members.toLocaleString() : "10,000+";

  return (
    <div className="mx-auto mt-3 flex max-w-6xl justify-center px-4">
      <p className="glass flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 rounded-full px-5 py-2">
        <span className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold leading-none text-gold">{count}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">members reading worldwide</span>
        </span>
        <span className="flex items-baseline gap-2">
          <span className="size-2 self-center rounded-full bg-mint" />
          <span className="font-serif text-lg font-semibold leading-none">{DEMO_ONLINE}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">online &amp; reading</span>
          <span className="rounded-full border border-border px-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">demo</span>
        </span>
      </p>
    </div>
  );
}
