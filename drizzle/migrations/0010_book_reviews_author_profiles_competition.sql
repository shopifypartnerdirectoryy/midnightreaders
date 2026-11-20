ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS synopsis text,
  ADD COLUMN IF NOT EXISTS buy_link text,
  ADD COLUMN IF NOT EXISTS other_purchase_links text,
  ADD COLUMN IF NOT EXISTS author_user_id uuid;

ALTER TABLE public.book_submissions
  ADD COLUMN IF NOT EXISTS synopsis text,
  ADD COLUMN IF NOT EXISTS author_country text,
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS author_website text,
  ADD COLUMN IF NOT EXISTS newsletter_link text,
  ADD COLUMN IF NOT EXISTS social_links text,
  ADD COLUMN IF NOT EXISTS publication_date date,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS series_info text,
  ADD COLUMN IF NOT EXISTS content_warnings text,
  ADD COLUMN IF NOT EXISTS other_purchase_links text;

ALTER TABLE public.community_applications
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS preferred_username text,
  ADD COLUMN IF NOT EXISTS favorite_genres text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_authors text,
  ADD COLUMN IF NOT EXISTS reading_interests text,
  ADD COLUMN IF NOT EXISTS why_join text,
  ADD COLUMN IF NOT EXISTS payment_date date,
  ADD COLUMN IF NOT EXISTS transaction_reference text,
  ADD COLUMN IF NOT EXISTS payer_name text,
  ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE public.community_applications DROP CONSTRAINT IF EXISTS community_applications_status_check;
ALTER TABLE public.community_applications ADD CONSTRAINT community_applications_status_check
  CHECK (status IN ('pending', 'payment_verification_pending', 'approved', 'rejected', 'additional_information_required'));

CREATE TABLE public.author_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  biography text,
  country text,
  website text,
  newsletter_link text,
  social_links text,
  spotlight_qualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(display_name) BETWEEN 1 AND 160),
  CHECK (biography IS NULL OR char_length(biography) <= 5000)
);
GRANT SELECT ON public.author_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.author_profiles TO authenticated;
GRANT ALL ON public.author_profiles TO service_role;
ALTER TABLE public.author_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read author profiles" ON public.author_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authors manage own profile" ON public.author_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage author profiles" ON public.author_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.book_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reviewer_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id),
  CHECK (char_length(reviewer_name) BETWEEN 1 AND 100),
  CHECK (char_length(body) <= 5000)
);
GRANT SELECT ON public.book_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.book_reviews TO authenticated;
GRANT ALL ON public.book_reviews TO service_role;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read book reviews" ON public.book_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members write own book reviews" ON public.book_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Members update own book reviews" ON public.book_reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Authors and admins delete reviews" ON public.book_reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.book_review_helpful (
  review_id uuid NOT NULL REFERENCES public.book_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.book_review_helpful TO authenticated;
GRANT ALL ON public.book_review_helpful TO service_role;
ALTER TABLE public.book_review_helpful ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view own helpful votes" ON public.book_review_helpful FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members mark helpful" ON public.book_review_helpful FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.book_reviews r WHERE r.id = review_id AND r.user_id <> auth.uid()));
CREATE POLICY "Members remove own helpful votes" ON public.book_review_helpful FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.book_review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.book_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE (review_id, user_id),
  CHECK (char_length(reason) BETWEEN 3 AND 1000)
);
GRANT SELECT, INSERT ON public.book_review_reports TO authenticated;
GRANT UPDATE ON public.book_review_reports TO authenticated;
GRANT ALL ON public.book_review_reports TO service_role;
ALTER TABLE public.book_review_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters and admins read review reports" ON public.book_review_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members report reviews" ON public.book_review_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Admins manage review reports" ON public.book_review_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.competition_book_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  campaign_key text NOT NULL DEFAULT 'reading-challenge-2026-2027',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id, campaign_key)
);
GRANT INSERT, UPDATE, DELETE ON public.competition_book_votes TO authenticated;
GRANT ALL ON public.competition_book_votes TO service_role;
ALTER TABLE public.competition_book_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved members cast book votes" ON public.competition_book_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Members update own book votes" ON public.competition_book_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Members remove own book votes" ON public.competition_book_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.community_application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.community_applications(id) ON DELETE CASCADE,
  actor_user_id uuid,
  previous_status text,
  new_status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_application_events TO authenticated;
GRANT ALL ON public.community_application_events TO service_role;
ALTER TABLE public.community_application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read application audit events" ON public.community_application_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_community_application_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.admin_note IS DISTINCT FROM NEW.admin_note THEN
    INSERT INTO public.community_application_events(application_id, actor_user_id, previous_status, new_status, note)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status, NEW.admin_note);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER community_application_status_audit
  AFTER UPDATE ON public.community_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_community_application_event();

GRANT UPDATE ON public.community_applications TO authenticated;
CREATE POLICY "Admins update community applications" ON public.community_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "members read comments" ON public.book_comments;
DROP POLICY IF EXISTS "post own comments" ON public.book_comments;
DROP POLICY IF EXISTS "delete own or admin" ON public.book_comments;
CREATE POLICY "Members read book comments" ON public.book_comments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Approved members post book comments" ON public.book_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Authors and admins delete book comments" ON public.book_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own progress" ON public.reading_progress;
CREATE POLICY "Members read own progress" ON public.reading_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Approved members manage own progress" ON public.reading_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Approved members update own progress" ON public.reading_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Approved members delete own progress" ON public.reading_progress FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));

DROP POLICY IF EXISTS "own shelf" ON public.shelf;
CREATE POLICY "Members read own shelf" ON public.shelf FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Approved members manage own shelf" ON public.shelf FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Approved members update own shelf" ON public.shelf FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Approved members delete own shelf" ON public.shelf FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.book_engagement_stats()
RETURNS TABLE(
  book_id uuid,
  readers bigint,
  finished bigint,
  comments bigint,
  average_rating numeric,
  rating_count bigint,
  review_count bigint,
  votes bigint,
  challenge_comments bigint,
  challenge_unique_readers bigint,
  challenge_completions bigint,
  engagement_score bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id,
    (SELECT count(DISTINCT s.user_id) FROM public.shelf s WHERE s.book_id = b.id AND s.status IN ('reading','read')),
    (SELECT count(DISTINCT s.user_id) FROM public.shelf s WHERE s.book_id = b.id AND s.status = 'read'),
    (SELECT count(*) FROM public.book_comments c WHERE c.book_id = b.id),
    COALESCE((SELECT avg(r.rating)::numeric(4,2) FROM public.book_reviews r WHERE r.book_id = b.id), 0),
    (SELECT count(*) FROM public.book_reviews r WHERE r.book_id = b.id),
    (SELECT count(*) FROM public.book_reviews r WHERE r.book_id = b.id AND char_length(trim(r.body)) > 0),
    (SELECT count(*) FROM public.competition_book_votes v WHERE v.book_id = b.id AND v.campaign_key = 'reading-challenge-2026-2027'),
    (SELECT count(*) FROM public.book_comments c WHERE c.book_id = b.id AND c.created_at >= timestamptz '2026-08-01 00:00:00+00' AND c.created_at < timestamptz '2027-09-01 00:00:00+00'),
    (SELECT count(DISTINCT participants.user_id) FROM (
      SELECT c.user_id FROM public.book_comments c WHERE c.book_id = b.id AND c.created_at >= timestamptz '2026-08-01 00:00:00+00' AND c.created_at < timestamptz '2027-09-01 00:00:00+00'
      UNION SELECT p.user_id FROM public.reading_progress p WHERE p.book_id = b.id AND p.updated_at >= timestamptz '2026-08-01 00:00:00+00' AND p.updated_at < timestamptz '2027-09-01 00:00:00+00'
      UNION SELECT r.user_id FROM public.book_reviews r WHERE r.book_id = b.id AND r.created_at >= timestamptz '2026-08-01 00:00:00+00' AND r.created_at < timestamptz '2027-09-01 00:00:00+00'
      UNION SELECT v.user_id FROM public.competition_book_votes v WHERE v.book_id = b.id AND v.created_at >= timestamptz '2026-08-01 00:00:00+00' AND v.created_at < timestamptz '2027-09-01 00:00:00+00'
    ) participants),
    (SELECT count(DISTINCT s.user_id) FROM public.shelf s WHERE s.book_id = b.id AND s.status = 'read' AND s.updated_at >= timestamptz '2026-08-01 00:00:00+00' AND s.updated_at < timestamptz '2027-09-01 00:00:00+00'),
    ((SELECT count(*) FROM public.book_comments c WHERE c.book_id = b.id AND c.created_at >= timestamptz '2026-08-01 00:00:00+00' AND c.created_at < timestamptz '2027-09-01 00:00:00+00') * 5
      + (SELECT count(*) FROM public.book_reviews r WHERE r.book_id = b.id AND r.created_at >= timestamptz '2026-08-01 00:00:00+00' AND r.created_at < timestamptz '2027-09-01 00:00:00+00' AND char_length(trim(r.body)) > 0) * 3
      + (SELECT count(DISTINCT participants.user_id) FROM (
          SELECT c.user_id FROM public.book_comments c WHERE c.book_id = b.id AND c.created_at >= timestamptz '2026-08-01 00:00:00+00' AND c.created_at < timestamptz '2027-09-01 00:00:00+00'
          UNION SELECT p.user_id FROM public.reading_progress p WHERE p.book_id = b.id AND p.updated_at >= timestamptz '2026-08-01 00:00:00+00' AND p.updated_at < timestamptz '2027-09-01 00:00:00+00'
          UNION SELECT r.user_id FROM public.book_reviews r WHERE r.book_id = b.id AND r.created_at >= timestamptz '2026-08-01 00:00:00+00' AND r.created_at < timestamptz '2027-09-01 00:00:00+00'
          UNION SELECT v.user_id FROM public.competition_book_votes v WHERE v.book_id = b.id AND v.created_at >= timestamptz '2026-08-01 00:00:00+00' AND v.created_at < timestamptz '2027-09-01 00:00:00+00'
        ) participants)
      + (SELECT count(DISTINCT s.user_id) FROM public.shelf s WHERE s.book_id = b.id AND s.status = 'read' AND s.updated_at >= timestamptz '2026-08-01 00:00:00+00' AND s.updated_at < timestamptz '2027-09-01 00:00:00+00') * 2
      + (SELECT count(*) FROM public.competition_book_votes v WHERE v.book_id = b.id AND v.campaign_key = 'reading-challenge-2026-2027') )::bigint
  FROM public.books b
$$;
GRANT EXECUTE ON FUNCTION public.book_engagement_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.book_review_helpful_counts()
RETURNS TABLE(review_id uuid, helpful_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, count(h.user_id)
  FROM public.book_reviews r LEFT JOIN public.book_review_helpful h ON h.review_id = r.id
  GROUP BY r.id
$$;
GRANT EXECUTE ON FUNCTION public.book_review_helpful_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.community_book_vote_counts(_campaign_key text DEFAULT 'reading-challenge-2026-2027')
RETURNS TABLE(book_id uuid, votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.book_id, count(*) FROM public.competition_book_votes v WHERE v.campaign_key = _campaign_key GROUP BY v.book_id
$$;
GRANT EXECUTE ON FUNCTION public.community_book_vote_counts(text) TO anon, authenticated;