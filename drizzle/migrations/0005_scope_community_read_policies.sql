DROP POLICY IF EXISTS "members read comments" ON public.book_comments;
CREATE POLICY "members read comments" ON public.book_comments
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_members m
    WHERE m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can browse buddy requests" ON public.community_buddy_requests;
CREATE POLICY "Members can browse buddy requests" ON public.community_buddy_requests
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_members m
    WHERE m.user_id = auth.uid()
  )
);