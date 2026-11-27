// Autonomous, server-only reading-room activity worker.
// Configure OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and WORKER_SECRET.
// Call with POST and Authorization: Bearer <WORKER_SECRET>. AI personas are clearly labeled.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("POST required", { status: 405, headers: cors });
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== Deno.env.get("WORKER_SECRET")) return new Response("Unauthorized", { status: 401, headers: cors });
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!openaiKey || !url || !serviceKey) return new Response("Worker secrets missing", { status: 500, headers: cors });
  const supabase = createClient(url, serviceKey);
  const { data: books, error } = await supabase.from("books").select("id,title,author_name,genre,description,synopsis,total_chapters").limit(40);
  if (error) return new Response(error.message, { status: 500, headers: cors });
  const results = [];
  for (const book of (books ?? [])) {
    const { count } = await supabase.from("reading_room_activity").select("id", { count: "exact", head: true }).eq("book_id", book.id).eq("actor_type", "ai").gte("created_at", new Date(Date.now()-6*60*60*1000).toISOString());
    if ((count ?? 0) >= 3) continue; // capped per book and window
    const { data: recent } = await supabase.from("reading_room_activity").select("body,persona_key,chapter").eq("book_id", book.id).order("created_at", { ascending:false }).limit(8);
    const prompt = `Create 1 short, thoughtful, spoiler-safe discussion contribution for a clearly fictional AI reading companion in a book community. Never claim to be a human or to have read chapters not supplied. Use only the metadata and existing discussion below; avoid spoilers and repetition. Book: ${book.title} by ${book.author_name}. Genre: ${book.genre ?? "unspecified"}. Description: ${(book.description ?? book.synopsis ?? "").slice(0,1200)}. Existing discussion: ${JSON.stringify(recent ?? [])}. Return JSON with persona_key (one of curious_reader, theme_explorer, gentle_skeptic, quote_lover), actor_label (persona name), chapter (integer from 0 to ${book.total_chapters ?? 0}), body (2-4 sentences), spoiler_level (integer 0).`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method:"POST", headers:{Authorization:"Bearer "+openaiKey,"Content-Type":"application/json"}, body:JSON.stringify({model:Deno.env.get("AI_MODEL") ?? "gpt-4o-mini",temperature:0.8,max_tokens:220,response_format:{type:"json_object"},messages:[{role:"system",content:"You generate transparently labeled AI reading companion posts, not fake human testimony."},{role:"user",content:prompt}]}) });
    if (!response.ok) { results.push({book_id:book.id,status:"provider_error"}); continue; }
    const payload = await response.json();
    let post; try { post = JSON.parse(payload.choices?.[0]?.message?.content ?? "{}"); } catch { continue; }
    if (!post.body || typeof post.body !== "string" || post.body.length > 1500 || !["curious_reader","theme_explorer","gentle_skeptic","quote_lover"].includes(post.persona_key)) continue;
    const { error: insertError } = await supabase.from("reading_room_activity").insert({ book_id:book.id, actor_type:"ai", actor_label:String(post.actor_label ?? "AI Reading Companion").slice(0,80), persona_key:post.persona_key, chapter:Math.max(0,Math.min(Number(book.total_chapters ?? 0),Number(post.chapter ?? 0))), body:post.body, spoiler_level:0 });
    results.push({book_id:book.id,status:insertError?"insert_error":"posted"});
  }
  return new Response(JSON.stringify({ processed:results.length, results }), {headers:{...cors,"Content-Type":"application/json"}});
});
