import { createFileRoute } from "@tanstack/react-router";
import { useEffect,useState } from "react";
import { supabase } from "@/integrations/supabase/client";
type EventItem={id:string;title:string;body:string;category:string;created_at:string};
export const Route=createFileRoute("/events")({component:Events});
function Events(){const [items,setItems]=useState<EventItem[]>([]);useEffect(()=>{supabase.from("spikes").select("id,title,body,category,created_at").eq("published",true).order("created_at",{ascending:false}).then(({data})=>setItems((data??[]) as EventItem[]))},[]);
return <main className="mx-auto max-w-5xl px-4 py-14"><p className="chip">Community calendar & announcements</p><h1 className="mt-4 font-serif text-5xl font-semibold">Events & reading activities</h1><p className="mt-4 text-muted-foreground">Published community activities and reading prompts.</p><div className="mt-8 grid gap-4">{items.map(i=><article key={i.id} className="glass rounded-2xl p-6"><p className="text-xs uppercase tracking-widest text-accent">{i.category} · {new Date(i.created_at).toLocaleDateString()}</p><h2 className="mt-2 font-serif text-2xl font-semibold">{i.title}</h2><p className="mt-3 whitespace-pre-line">{i.body}</p></article>)}{!items.length&&<p className="text-muted-foreground">No published events or activities yet.</p>}</div></main>}
