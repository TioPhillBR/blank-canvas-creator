-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view banners
CREATE POLICY "Public read access for banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Allow admins to upload banners
CREATE POLICY "Admins can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update banners
CREATE POLICY "Admins can update banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete banners
CREATE POLICY "Admins can delete banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners'
  AND public.has_role(auth.uid(), 'admin')
);