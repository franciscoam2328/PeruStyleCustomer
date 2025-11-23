-- Add columns for Maker Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS bio_short text;

-- Create storage bucket for portfolio if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio
DROP POLICY IF EXISTS "Portfolio images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Makers can upload portfolio images." ON storage.objects;
DROP POLICY IF EXISTS "Makers can update own portfolio images." ON storage.objects;

CREATE POLICY "Portfolio images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'portfolio' );
CREATE POLICY "Makers can upload portfolio images." ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'portfolio' AND auth.role() = 'authenticated' );
CREATE POLICY "Makers can update own portfolio images." ON storage.objects FOR UPDATE USING ( bucket_id = 'portfolio' AND auth.uid() = owner );
