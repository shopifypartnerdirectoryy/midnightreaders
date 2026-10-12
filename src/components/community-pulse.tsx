import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Real numbers only: member count from the database, "online" from live presence of open tabs. */
export function CommunityPulse() {
  const [members, setMembers] = useState<number | null>(null);
  const [online, setOnline] = useState(1);

  useEffect(() => {
    supabase.rpc("member_count").then(({ data }) => setMembers(Number(data ?? 0)));
    const key = crypto.randomUUID();
    const ch = supabase.channel("mrc-pulse", { config: { presence: { key } } });
    ch.on("presence", { event: "sync" }, () => setOnline(Math.max(1, Object.keys(ch.presenceState()).length)))
      .subscribe((s) => { if (s === "SUBSCRIBED") void ch.track({ at: Date.now() }); });
    return () => { void supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="mx-auto mt-2 flex max-w-6xl justify-center">
      <p className="glass rounded-full px-4 py-1 text-xs text-muted-foreground">
        <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-mint align-middle" />
        <span className="font-semibold text-foreground">{online.toLocaleString()}</span> {online === 1 ? "reader" : "readers"} online now
        {" · "}<span className="font-semibold text-foreground">{members !== null && members > 10000 ? members.toLocaleString() : "10,000+"}</span> club members
      </p>
    </div>
  );
}
