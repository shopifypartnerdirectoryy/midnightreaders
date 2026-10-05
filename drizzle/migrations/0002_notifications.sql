CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'announcement',
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or broadcast" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mark own read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins post" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete" ON public.notifications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.notify_submission_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.user_id, 'submission',
      '"' || NEW.title || '" was ' || NEW.status,
      COALESCE(NEW.admin_note, CASE WHEN NEW.status='approved' THEN 'Your book is now listed in Book Discovery.' ELSE NULL END),
      '/dashboard');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER submission_status_notify AFTER UPDATE ON public.book_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_submission_status();

CREATE OR REPLACE FUNCTION public.notify_new_spike()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.published THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NULL, 'spike', 'New Midnight Spike: ' || NEW.title, NEW.category, '/spikes');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER spike_notify AFTER INSERT ON public.spikes
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_spike();