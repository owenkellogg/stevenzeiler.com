-- Create the residences table
CREATE TABLE residences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}'::TEXT[],
    capacity INTEGER,
    amenities TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'current',  -- 'current' or 'target'
    estimated_cost DECIMAL(12,2),  -- For target residences
    target_date DATE,             -- For target residences
    created_by UUID REFERENCES auth.users(id)
);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_residences_updated_at
    BEFORE UPDATE ON residences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create policies
-- Enable RLS
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read current residences
CREATE POLICY "Anyone can view current residences" ON residences
    FOR SELECT
    USING (status = 'current');

-- Allow admin to read all residences
CREATE POLICY "Admin can view all residences" ON residences
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
    );

-- Allow admin to insert residences
CREATE POLICY "Admin can insert residences" ON residences
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
    );

-- Allow admin to update their residences
CREATE POLICY "Admin can update residences" ON residences
    FOR UPDATE
    USING (
        auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
    );

-- Allow admin to delete their residences
CREATE POLICY "Admin can delete residences" ON residences
    FOR DELETE
    USING (
        auth.jwt() ->> 'email' = 'me@stevenzeiler.com'
    );

-- Create indexes
CREATE INDEX residences_status_idx ON residences(status);
CREATE INDEX residences_created_by_idx ON residences(created_by); 