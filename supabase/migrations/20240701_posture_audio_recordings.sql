-- Create table for posture audio recordings
CREATE TABLE IF NOT EXISTS posture_audio_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posture_id TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'bikram-26',
  language TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  script_text TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE posture_audio_recordings ENABLE ROW LEVEL SECURITY;

-- Policy for viewing recordings (anyone can view)
CREATE POLICY "Anyone can view posture recordings" 
  ON posture_audio_recordings 
  FOR SELECT 
  USING (true);

-- Policy for inserting recordings (only admins)
CREATE POLICY "Only admins can insert posture recordings" 
  ON posture_audio_recordings 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Policy for updating recordings (only admins)
CREATE POLICY "Only admins can update posture recordings" 
  ON posture_audio_recordings 
  FOR UPDATE 
  USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Policy for deleting recordings (only admins)
CREATE POLICY "Only admins can delete posture recordings" 
  ON posture_audio_recordings 
  FOR DELETE 
  USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Create function to ensure only one default recording per posture per language
CREATE OR REPLACE FUNCTION ensure_single_default_recording()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE posture_audio_recordings
    SET is_default = false
    WHERE posture_id = NEW.posture_id
      AND series = NEW.series
      AND language = NEW.language
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single default recording per language
CREATE TRIGGER ensure_single_default_recording_trigger
BEFORE INSERT OR UPDATE ON posture_audio_recordings
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_recording();

-- Create index for faster queries
CREATE INDEX idx_posture_audio_recordings_posture_id_series_language 
ON posture_audio_recordings(posture_id, series, language);

-- Create storage bucket for audio recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('posture_audio', 'posture_audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'posture_audio');

-- Allow admin to upload to the bucket
CREATE POLICY "Admin Upload Access" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'posture_audio' AND
    auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
  );

-- Allow admin to update objects in the bucket
CREATE POLICY "Admin Update Access" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'posture_audio' AND
    auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
  );

-- Allow admin to delete objects from the bucket
CREATE POLICY "Admin Delete Access" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'posture_audio' AND
    auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
  ); 