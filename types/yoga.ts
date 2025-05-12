// Define TypeScript types for Supabase yoga scheduling tables

export interface YogaClassType {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  audio_url: string;
  cover_image_url: string | null;
  yoga_type: string;
  instructor: string | null;
  active: boolean;
}

export interface YogaScheduledClass {
  id: string;
  created_at: string;
  updated_at: string;
  class_type_id: string;
  scheduled_start_time: string;
  recurrence: string | null;
  recurrence_end_date: string | null;
  max_participants: number | null;
  current_participants: number;
  notes: string | null;
  created_by: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  zoom_link: string | null;
  is_public: boolean;
}

export interface YogaClassParticipant {
  id: string;
  created_at: string;
  scheduled_class_id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  attendance_status: 'registered' | 'attended' | 'no-show';
  feedback: string | null;
  rating: number | null;
}

// Join type with class type information included
export interface YogaScheduledClassWithType extends YogaScheduledClass {
  yoga_class_type: YogaClassType;
}

// Status options
export type YogaClassStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// Recurrence options
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'; 