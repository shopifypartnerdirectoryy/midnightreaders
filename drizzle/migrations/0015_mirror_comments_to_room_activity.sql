-- Mirror approved member chapter comments into the room activity feed.
CREATE OR REPLACE FUNCTION public.mirror_book_comment_to_room_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.reading_room_activity(book_id,actor_type,actor_user_id,actor_label,chapter,body,spoiler_level)
 VALUES(NEW.book_id,'human',NEW.user_id,LEFT(COALESCE(NULLIF(NEW.author_name,''),'Community reader'),80),NEW.chapter,NEW.body,0);
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS book_comment_room_activity_trigger ON public.book_comments;
CREATE TRIGGER book_comment_room_activity_trigger AFTER INSERT ON public.book_comments
FOR EACH ROW EXECUTE FUNCTION public.mirror_book_comment_to_room_activity();
