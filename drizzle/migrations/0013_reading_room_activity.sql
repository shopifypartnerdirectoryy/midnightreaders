-- Persistent activity timeline for book-specific reading rooms.
-- Apply via the Supabase migration process before wiring the UI/AI worker to this table.
CREATE TABLE IF NOT EXISTS public.reading_room_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  actor_type text NOT NULL CHECK (actor_type IN ('human','ai','system')),
  actor_user_id uuid,
  actor_label text NOT NULL,
  persona_key text,
  chapter integer NOT NULL DEFAULT 0 CHECK (chapter >= 0),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  spoiler_level integer NOT NULL DEFAULT 0 CHECK (spoiler_level >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reading_room_activity_book_recent_idx ON public.reading_room_activity(book_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reading_room_activity_book_chapter_idx ON public.reading_room_activity(book_id, chapter, created_at);
ALTER TABLE public.reading_room_activity ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.reading_room_activity TO authenticated;
GRANT ALL ON public.reading_room_activity TO service_role;
-- Membership check scopes the discussion timeline to approved community members.
CREATE POLICY "Approved members read room activity" ON public.reading_room_activity
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
-- Human contributions cannot impersonate AI personas. AI/system rows are reserved for server-side service-role workers.
CREATE POLICY "Approved members contribute human activity" ON public.reading_room_activity
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_type = 'human'
    AND actor_user_id = auth.uid()
    AND actor_label <> ''
    AND persona_key IS NULL
    AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid())
  );
