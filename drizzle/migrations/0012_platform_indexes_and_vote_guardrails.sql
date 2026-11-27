-- Supplemental indexes and vote constraints for the community ranking experience.
-- Apply through the Supabase migration workflow; this file does not run automatically.
CREATE INDEX IF NOT EXISTS book_comments_book_chapter_created_idx ON public.book_comments(book_id, chapter, created_at DESC);
CREATE INDEX IF NOT EXISTS reading_progress_book_chapter_idx ON public.reading_progress(book_id, chapter);
CREATE INDEX IF NOT EXISTS book_reviews_book_created_idx ON public.book_reviews(book_id, created_at DESC);
CREATE INDEX IF NOT EXISTS competition_book_votes_campaign_book_idx ON public.competition_book_votes(campaign_key, book_id);
CREATE INDEX IF NOT EXISTS author_profiles_spotlight_idx ON public.author_profiles(spotlight_qualified_at) WHERE spotlight_qualified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS books_author_user_id_idx ON public.books(author_user_id) WHERE author_user_id IS NOT NULL;
