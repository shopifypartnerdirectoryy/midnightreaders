-- Worker safety and access guardrails for AI room activity.
-- AI posts are server-side only; service_role bypasses RLS.
ALTER TABLE public.reading_room_activity
  ADD CONSTRAINT reading_room_ai_label_check CHECK (actor_type <> 'ai' OR actor_label ILIKE '%AI%');
CREATE INDEX IF NOT EXISTS reading_room_ai_rate_idx ON public.reading_room_activity(book_id, actor_type, created_at DESC);
