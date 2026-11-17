ALTER TABLE public.community_applications
  ADD CONSTRAINT community_applications_email_shape CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  ADD CONSTRAINT community_applications_proof_owner CHECK (payment_proof_path IS NULL OR payment_proof_path LIKE (user_id::text || '/%')),
  ADD CONSTRAINT community_applications_existing_id_shape CHECK (existing_member_id IS NULL OR upper(trim(existing_member_id)) ~ '^MRC-[A-Z0-9-]{4,32}$');