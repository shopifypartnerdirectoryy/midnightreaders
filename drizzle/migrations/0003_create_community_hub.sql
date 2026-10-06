CREATE TABLE public.community_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own community membership" ON public.community_members FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members can join the community" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave the community" ON public.community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 60),
  category text NOT NULL CHECK (category IN ('Announcements', 'BOTM', 'Buddy Reads')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_discussions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_discussions TO authenticated;
GRANT ALL ON public.community_discussions TO service_role;
ALTER TABLE public.community_discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussions are publicly readable" ON public.community_discussions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members can start discussions" ON public.community_discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Authors can update own discussions" ON public.community_discussions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors and admins can delete discussions" ON public.community_discussions FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX community_discussions_created_at_idx ON public.community_discussions (created_at DESC);

CREATE TABLE public.community_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_key text NOT NULL,
  choice text NOT NULL CHECK (char_length(choice) BETWEEN 1 AND 140),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, poll_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_poll_votes TO authenticated;
GRANT ALL ON public.community_poll_votes TO service_role;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own poll votes" ON public.community_poll_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members can cast poll votes" ON public.community_poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Members can change own poll votes" ON public.community_poll_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can remove own poll votes" ON public.community_poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_buddy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_title text NOT NULL CHECK (char_length(book_title) BETWEEN 1 AND 140),
  pace text NOT NULL CHECK (pace IN ('Relaxed', 'Steady', 'Quick')),
  availability text NOT NULL CHECK (char_length(availability) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_title)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_buddy_requests TO authenticated;
GRANT ALL ON public.community_buddy_requests TO service_role;
ALTER TABLE public.community_buddy_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can browse buddy requests" ON public.community_buddy_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can create buddy requests" ON public.community_buddy_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid()));
CREATE POLICY "Members can update own buddy requests" ON public.community_buddy_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can delete own buddy requests" ON public.community_buddy_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);