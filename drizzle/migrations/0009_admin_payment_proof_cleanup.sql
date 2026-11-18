CREATE POLICY "admins can remove payment proof"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'community-payment-proofs'
    AND public.has_role(auth.uid(), 'admin')
  );