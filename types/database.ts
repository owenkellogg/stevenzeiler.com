export interface Organization {
  id: string;
  name: string | null;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  social_media: Record<string, any>;
  created_at: string;
  updated_at: string;
  relationship_type: string[];
  // Joined data
  organization?: Organization;
} 