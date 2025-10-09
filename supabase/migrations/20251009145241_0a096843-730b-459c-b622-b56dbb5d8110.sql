-- Fix storage policies for transformations bucket
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own transformations" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own transformations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own transformations" ON storage.objects;

-- Create proper storage policies for transformations bucket
CREATE POLICY "Users can upload transformations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transformations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view transformations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transformations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update transformations"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'transformations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete transformations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transformations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add face_analysis_cache table for storing AI analysis results
CREATE TABLE IF NOT EXISTS public.face_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_hash TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  confidence_score NUMERIC,
  detected_gender TEXT,
  detected_emotion TEXT,
  detected_age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_hash)
);

ALTER TABLE public.face_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analysis"
ON public.face_analysis_cache FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
ON public.face_analysis_cache FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_face_analysis_user_hash ON public.face_analysis_cache(user_id, image_hash);