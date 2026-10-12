ALTER TABLE public.books ADD COLUMN IF NOT EXISTS total_chapters integer NOT NULL DEFAULT 12;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publisher text;

CREATE TABLE public.reading_progress (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter integer NOT NULL DEFAULT 0 CHECK (chapter >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.reading_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.book_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text NOT NULL,
  chapter integer NOT NULL CHECK (chapter >= 1),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.book_comments TO authenticated;
GRANT ALL ON public.book_comments TO service_role;
ALTER TABLE public.book_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read comments" ON public.book_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "post own comments" ON public.book_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own or admin" ON public.book_comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Real, aggregate-only stats (no personal data exposed)
CREATE OR REPLACE FUNCTION public.book_stats()
RETURNS TABLE(book_id uuid, readers bigint, finished bigint, week_activity bigint, comments bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id,
    (SELECT count(*) FROM shelf s WHERE s.book_id=b.id AND s.status IN ('reading','read')),
    (SELECT count(*) FROM shelf s WHERE s.book_id=b.id AND s.status='read'),
    (SELECT count(*) FROM shelf s WHERE s.book_id=b.id AND s.updated_at > now()-interval '7 days')
      + (SELECT count(*) FROM book_comments c WHERE c.book_id=b.id AND c.created_at > now()-interval '7 days')
      + (SELECT count(*) FROM reading_progress p WHERE p.book_id=b.id AND p.updated_at > now()-interval '7 days'),
    (SELECT count(*) FROM book_comments c WHERE c.book_id=b.id)
  FROM books b
$$;
GRANT EXECUTE ON FUNCTION public.book_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.member_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT count(*) FROM profiles $$;
GRANT EXECUTE ON FUNCTION public.member_count() TO anon, authenticated;