CREATE TABLE public.community_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  full_name text NOT NULL,
  email text NOT NULL,
  application_type text NOT NULL DEFAULT 'payment' CHECK (application_type IN ('payment', 'existing')),
  payment_proof_path text,
  existing_member_id text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  member_id text UNIQUE,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(full_name) BETWEEN 2 AND 100),
  CHECK (char_length(email) BETWEEN 3 AND 255),
  CHECK (message IS NULL OR char_length(message) <= 1000),
  CHECK (
    (application_type = 'payment' AND payment_proof_path IS NOT NULL AND existing_member_id IS NULL)
    OR
    (application_type = 'existing' AND existing_member_id IS NOT NULL AND payment_proof_path IS NULL)
  )
);

CREATE UNIQUE INDEX community_applications_one_pending_per_user
  ON public.community_applications (user_id)
  WHERE status = 'pending';

GRANT SELECT, INSERT ON public.community_applications TO authenticated;
GRANT ALL ON public.community_applications TO service_role;

ALTER TABLE public.community_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own or admin community applications"
  ON public.community_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "submit own community application"
  ON public.community_applications FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND member_id IS NULL
  );

ALTER TABLE public.community_members ADD COLUMN member_id text UNIQUE;

CREATE POLICY "members can upload own payment proof"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'community-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "members and admins can read payment proof"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'community-payment-proofs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "members can remove own payment proof"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'community-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.review_community_application(
  _application_id uuid,
  _approve boolean,
  _admin_note text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_record public.community_applications%ROWTYPE;
  assigned_id text;
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  position integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only community admins can review applications';
  END IF;

  IF _admin_note IS NOT NULL AND char_length(_admin_note) > 1000 THEN
    RAISE EXCEPTION 'Admin note is too long';
  END IF;

  SELECT * INTO application_record
  FROM public.community_applications
  WHERE id = _application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF application_record.status <> 'pending' THEN
    RAISE EXCEPTION 'This application has already been reviewed';
  END IF;

  IF NOT _approve THEN
    UPDATE public.community_applications
    SET status = 'rejected', admin_note = _admin_note,
        reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = application_record.id;

    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (
      application_record.user_id,
      'community_application',
      'Community application update',
      COALESCE(_admin_note, 'Your request was not approved. You may apply again with updated details.'),
      '/community/join'
    );
    RETURN NULL;
  END IF;

  IF application_record.application_type = 'existing' THEN
    assigned_id := upper(trim(application_record.existing_member_id));
    IF assigned_id !~ '^MRC-[A-Z0-9-]{4,32}$' THEN
      RAISE EXCEPTION 'The existing ID must begin with MRC- and contain only letters, numbers, or hyphens';
    END IF;
  ELSE
    LOOP
      assigned_id := 'MRC-' || extract(year from now())::text || '-';
      FOR position IN 1..6 LOOP
        assigned_id := assigned_id || substr(alphabet, 1 + floor(random() * char_length(alphabet))::integer, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.community_members WHERE member_id = assigned_id)
        AND NOT EXISTS (SELECT 1 FROM public.community_applications WHERE member_id = assigned_id);
    END LOOP;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.community_members
    WHERE member_id = assigned_id AND user_id <> application_record.user_id
  ) OR EXISTS (
    SELECT 1 FROM public.community_applications
    WHERE member_id = assigned_id AND user_id <> application_record.user_id AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'This member ID is already assigned to another reader';
  END IF;

  INSERT INTO public.community_members (user_id, member_id)
  VALUES (application_record.user_id, assigned_id)
  ON CONFLICT (user_id) DO UPDATE SET member_id = EXCLUDED.member_id;

  UPDATE public.community_applications
  SET status = 'approved', member_id = assigned_id, admin_note = _admin_note,
      reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = application_record.id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (
    application_record.user_id,
    'community_application',
    'Welcome to The Midnight Readers',
    'Your community access is approved. Your member ID is ' || assigned_id || '.',
    '/community'
  );

  RETURN assigned_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_community_application(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_community_application(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_community_application(uuid, boolean, text) TO service_role;