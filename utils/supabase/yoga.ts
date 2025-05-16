import { createClient } from './client';
import { YogaClassType, YogaScheduledClass, YogaScheduledClassWithType } from '@/types/yoga';

// Fetch all available yoga class types 
export async function fetchYogaClassTypes(): Promise<YogaClassType[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_class_types')
    .select('*')
    .eq('active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching yoga class types:', error);
    throw error;
  }
  
  return data;
}

// Fetch a single yoga class type by id
export async function fetchYogaClassTypeById(id: string): Promise<YogaClassType | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_class_types')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching yoga class type:', error);
    throw error;
  }
  
  return data;
}

// Fetch upcoming scheduled yoga classes (with class type information)
export async function fetchUpcomingYogaClasses(): Promise<YogaScheduledClassWithType[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_scheduled_classes')
    .select(`
      *,
      yoga_class_type:yoga_class_types!class_type_id(*)
    `)
    .gte('scheduled_start_time', new Date().toISOString())
    .eq('status', 'scheduled')
    .eq('is_public', true)
    .order('scheduled_start_time');
    
  if (error) {
    console.error('Error fetching upcoming yoga classes:', error);
    throw error;
  }
  
  return data;
}

// Fetch a scheduled class by ID (with class type information)
export async function fetchScheduledClassById(id: string): Promise<YogaScheduledClassWithType | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_scheduled_classes')
    .select(`
      *,
      yoga_class_type:yoga_class_types!class_type_id(*)
    `)
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching scheduled class:', error);
    throw error;
  }
  
  return data;
}

// Fetch the next upcoming yoga class
export async function fetchNextScheduledClass(): Promise<YogaScheduledClassWithType | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_scheduled_classes')
    .select(`
      *,
      yoga_class_type:yoga_class_types!class_type_id(*)
    `)
    .gte('scheduled_start_time', new Date().toISOString())
    .eq('status', 'scheduled')
    .eq('is_public', true)
    .order('scheduled_start_time')
    .limit(1)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching next scheduled class:', error);
    throw error;
  }
  
  return data;
}

// Create a new scheduled yoga class
export async function createScheduledClass(
  classTypeId: string, 
  scheduledStartTime: Date, 
  options: {
    recurrence?: string;
    recurrenceEndDate?: Date;
    maxParticipants?: number;
    notes?: string;
    zoomLink?: string;
    isPublic?: boolean;
  } = {}
): Promise<YogaScheduledClass> {
  const supabase = createClient();
  
  try {
    // Try to insert with error handling
    const { data, error } = await supabase
      .from('yoga_scheduled_classes')
      .insert({
        class_type_id: classTypeId,
        scheduled_start_time: scheduledStartTime.toISOString(),
        recurrence: options.recurrence,
        recurrence_end_date: options.recurrenceEndDate?.toISOString(),
        max_participants: options.maxParticipants,
        notes: options.notes,
        zoom_link: options.zoomLink,
        is_public: options.isPublic ?? true,
        status: 'scheduled'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating scheduled class:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Error in createScheduledClass:', err);
    
    // Provide a more detailed error message
    if (err && typeof err === 'object' && 'code' in err) {
      const supabaseError = err as any;
      if (supabaseError.code === '42501') {
        console.error('This is a Row Level Security policy error. Please run the rls-fix.sql script in Supabase.');
      }
    }
    
    throw err;
  }
}

// Register a participant for a yoga class
export async function registerForClass(
  scheduledClassId: string,
  userInfo: {
    userId?: string;
    userEmail?: string;
    userName?: string;
  }
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('yoga_class_participants')
    .insert({
      scheduled_class_id: scheduledClassId,
      user_id: userInfo.userId,
      user_email: userInfo.userEmail,
      user_name: userInfo.userName,
      attendance_status: 'registered'
    });
    
  if (error) {
    console.error('Error registering for class:', error);
    throw error;
  }
}

// Update a scheduled class status
export async function updateClassStatus(
  classId: string, 
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('yoga_scheduled_classes')
    .update({ status })
    .eq('id', classId);
    
  if (error) {
    console.error('Error updating class status:', error);
    throw error;
  }
}

// Fetch past yoga classes (with class type information)
export async function fetchPastYogaClasses(limit: number = 10, offset: number = 0): Promise<YogaScheduledClassWithType[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('yoga_scheduled_classes')
    .select(`
      *,
      yoga_class_type:yoga_class_types!class_type_id(*)
    `)
    .lt('scheduled_start_time', new Date().toISOString())
    // Show all past classes regardless of status
    .order('scheduled_start_time', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (error) {
    console.error('Error fetching past yoga classes:', error);
    throw error;
  }
  
  return data;
}