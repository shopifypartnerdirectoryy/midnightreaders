CREATE OR REPLACE FUNCTION public.community_poll_counts(_poll_key text)
RETURNS TABLE(choice text, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.choice, count(*)
  FROM public.community_poll_votes v
  WHERE v.poll_key = _poll_key
  GROUP BY v.choice
$$;
REVOKE ALL ON FUNCTION public.community_poll_counts(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_poll_counts(text) TO anon, authenticated;