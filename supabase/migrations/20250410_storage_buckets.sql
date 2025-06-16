-- Création des buckets pour le stockage de fichiers
DO $$
BEGIN
  -- Création des buckets s'ils n'existent pas déjà
  INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('documents', 'documents', true),
    ('photos', 'photos', true),
    ('annotations', 'annotations', true),
    ('signatures', 'signatures', true)
  ON CONFLICT (id) DO NOTHING;

  -- Vérification que les buckets ont été créés
  RAISE NOTICE 'Buckets créés ou déjà existants: documents, photos, annotations, signatures';
END $$;

-- Politiques pour les objets dans le bucket "documents"
CREATE POLICY "Documents Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Documents Insert Access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Documents Update Access"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Documents Delete Access"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Répéter pour les autres buckets (photos, annotations, signatures)
-- Bucket "photos"
CREATE POLICY "Photos Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Photos Insert Access"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Photos Update Access" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Photos Delete Access" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

-- Bucket "annotations"
CREATE POLICY "Annotations Public Access" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'annotations');

CREATE POLICY "Annotations Insert Access" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'annotations' AND auth.uid() IS NOT NULL);

CREATE POLICY "Annotations Update Access" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'annotations' AND auth.uid() IS NOT NULL);

CREATE POLICY "Annotations Delete Access" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'annotations' AND auth.uid() IS NOT NULL);

-- Bucket "signatures"
CREATE POLICY "Signatures Public Access" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures');

CREATE POLICY "Signatures Insert Access" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Signatures Update Access" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Signatures Delete Access" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'signatures' AND auth.uid() IS NOT NULL);