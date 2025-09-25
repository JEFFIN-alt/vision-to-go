-- Create storage buckets for LOOKMAGIC
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('transformations', 'transformations', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create storage policies for transformations bucket
CREATE POLICY "Users can upload their own transformations"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'transformations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own transformations"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'transformations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for avatars bucket  
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);