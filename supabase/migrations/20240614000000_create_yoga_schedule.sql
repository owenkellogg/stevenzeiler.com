-- Create the yoga_class_types table
CREATE TABLE yoga_class_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    audio_url TEXT NOT NULL,
    cover_image_url TEXT,
    yoga_type TEXT NOT NULL, -- e.g., 'bikram', 'hatha', etc.
    instructor TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- Create the yoga_scheduled_classes table
CREATE TABLE yoga_scheduled_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    class_type_id UUID NOT NULL REFERENCES yoga_class_types(id),
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence TEXT, -- 'none', 'daily', 'weekly', 'monthly'
    recurrence_end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in-progress', 'completed', 'cancelled'
    zoom_link TEXT,
    is_public BOOLEAN DEFAULT TRUE
);

-- Create an updated_at trigger for class types
CREATE TRIGGER update_yoga_class_types_updated_at
    BEFORE UPDATE ON yoga_class_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create an updated_at trigger for scheduled classes
CREATE TRIGGER update_yoga_scheduled_classes_updated_at
    BEFORE UPDATE ON yoga_scheduled_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create the yoga_class_participants table (for tracking who joined which class)
CREATE TABLE yoga_class_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    scheduled_class_id UUID NOT NULL REFERENCES yoga_scheduled_classes(id),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_name TEXT,
    attendance_status TEXT DEFAULT 'registered', -- 'registered', 'attended', 'no-show'
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE yoga_class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_scheduled_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_class_participants ENABLE ROW LEVEL SECURITY;

-- Policies for yoga_class_types
CREATE POLICY "Anyone can view active class types" ON yoga_class_types
    FOR SELECT
    USING (active = TRUE);

CREATE POLICY "Admin can manage all class types" ON yoga_class_types
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Policies for yoga_scheduled_classes
CREATE POLICY "Anyone can view public scheduled classes" ON yoga_scheduled_classes
    FOR SELECT
    USING (is_public = TRUE AND status IN ('scheduled', 'in-progress'));

CREATE POLICY "Admin can manage all scheduled classes" ON yoga_scheduled_classes
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Allow anonymous users to create scheduled classes
CREATE POLICY "Anyone can create scheduled classes" ON yoga_scheduled_classes
    FOR INSERT
    WITH CHECK (TRUE);

-- Policies for yoga_class_participants
CREATE POLICY "Users can see their own registrations" ON yoga_class_participants
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admin can see all participants" ON yoga_class_participants
    FOR SELECT
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

CREATE POLICY "Users can register themselves" ON yoga_class_participants
    FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Admin can manage all participants" ON yoga_class_participants
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Create indexes
CREATE INDEX yoga_class_types_active_idx ON yoga_class_types(active);
CREATE INDEX yoga_scheduled_classes_time_idx ON yoga_scheduled_classes(scheduled_start_time);
CREATE INDEX yoga_scheduled_classes_status_idx ON yoga_scheduled_classes(status);
CREATE INDEX yoga_class_participants_class_idx ON yoga_class_participants(scheduled_class_id);
CREATE INDEX yoga_class_participants_user_idx ON yoga_class_participants(user_id);

-- Insert default yoga class types
INSERT INTO yoga_class_types (name, description, duration_minutes, audio_url, yoga_type, instructor)
VALUES 
    ('90-Minute Bikram Yoga', 'Follow along with the complete 90-minute Bikram sequence with detailed instructions', 90, 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//yoga_series_26_full_2024_06_18.mp3', 'bikram', 'Steven Zeiler'),
    ('90-Minute Bikram Yoga (English)', 'Follow along with this 90-minute Bikram yoga class with English instructions', 90, 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//90-minute-hot-yoga-bikram-yoga-english-with-gary-olson%20(1).mp3', 'bikram', 'Gary Olson'),
    ('30-Minute Express Bikram', 'A shorter version of the classic sequence for when you''re short on time', 30, 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//Yoga+Practice+30+Mins.mp3', 'bikram', 'Steven Zeiler');

-- Insert sample scheduled class for tomorrow
INSERT INTO yoga_scheduled_classes (class_type_id, scheduled_start_time, status, is_public)
VALUES (
    (SELECT id FROM yoga_class_types WHERE name = '90-Minute Bikram Yoga (English)'),
    (CURRENT_TIMESTAMP + INTERVAL '1 day')::timestamp AT TIME ZONE 'UTC',
    'scheduled',
    TRUE
); 