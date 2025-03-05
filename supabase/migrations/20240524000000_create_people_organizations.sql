-- Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create people table
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    organization_id UUID REFERENCES organizations(id),
    title TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    relationship_type TEXT[]
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage organizations" ON organizations
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

CREATE POLICY "Admin can manage people" ON people
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'me@stevenzeiler.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'me@stevenzeiler.com');

-- Create indexes
CREATE INDEX people_organization_id_idx ON people(organization_id);
CREATE INDEX people_email_idx ON people(email);
CREATE INDEX organizations_name_idx ON organizations(name); 