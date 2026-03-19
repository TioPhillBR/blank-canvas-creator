
-- Create storage bucket for employee photos
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-photos', 'employee-photos', true);

-- Allow public read access
CREATE POLICY "Employee photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-photos');

-- Allow public uploads (prototype)
CREATE POLICY "Anyone can upload employee photos (prototype)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-photos');
