'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { fetchUpcomingYogaClasses, registerForClass } from '@/utils/supabase/yoga';
import { YogaScheduledClassWithType } from '@/types/yoga';
import { downloadICSFile } from '@/utils/icsGenerator';
import { trackEvent } from '@/utils/analytics';
import { createBrowserClient } from '@supabase/ssr';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function YogaScheduleList() {
  const { dictionary } = useLanguage();
  const [classes, setClasses] = useState<YogaScheduledClassWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch upcoming yoga classes and user data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Get upcoming classes
        const upcomingClasses = await fetchUpcomingYogaClasses();
        setClasses(upcomingClasses);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, [supabase.auth]);

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate time until class starts
  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const scheduledTime = new Date(dateString);
    const differenceMs = scheduledTime.getTime() - now.getTime();
    
    if (differenceMs <= 0) {
      return 'Starting now';
    }
    
    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((differenceMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hr`;
    } else if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  // Handle adding to calendar
  const handleAddToCalendar = (yogaClass: YogaScheduledClassWithType) => {
    // Track the calendar download event
    trackEvent('calendar_download', {
      classId: yogaClass.id,
      className: yogaClass.yoga_class_type.name,
      classType: yogaClass.yoga_class_type.yoga_type,
      scheduledTime: yogaClass.scheduled_start_time,
      source: 'list_page',
      duration: yogaClass.yoga_class_type.duration_minutes
    });
    
    // Calculate end time based on class duration
    const startTime = new Date(yogaClass.scheduled_start_time);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + yogaClass.yoga_class_type.duration_minutes);
    
    // Create event data
    const classUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/yoga/scheduled?classId=${yogaClass.id}`
      : `https://stevenzeiler.com/yoga/scheduled?classId=${yogaClass.id}`;
    
    // Download the .ics file
    downloadICSFile({
      title: `Yoga Class: ${yogaClass.yoga_class_type.name}`,
      description: yogaClass.yoga_class_type.description || 
        `Join this ${yogaClass.yoga_class_type.duration_minutes}-minute yoga class with ${yogaClass.yoga_class_type.instructor || 'Steven Zeiler'}.`,
      location: 'Online',
      startTime,
      endTime,
      url: classUrl
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Upcoming Yoga Classes</h1>
          <p className="text-xl md:text-2xl text-earth-300 max-w-3xl mx-auto">
            Join a scheduled yoga session with auto-playing audio guidance
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-earth-100">Schedule</h2>
            <Link
              href="/yoga/scheduled/setup"
              className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded-lg transition-colors"
            >
              + Schedule New Class
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
              <p className="text-earth-200">Loading scheduled classes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
              <p className="text-red-200">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-forest-800 hover:bg-forest-700 text-earth-100 px-4 py-2 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
              <p className="text-earth-200 mb-4">No upcoming classes scheduled</p>
              <Link
                href="/yoga/scheduled/setup"
                className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-2 rounded-lg transition-colors"
              >
                Schedule Your First Class
              </Link>
            </div>
          ) : (
            <motion.div
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
              }}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {classes.map((yogaClass) => (
                <motion.div
                  key={yogaClass.id}
                  variants={fadeInUp}
                  className="bg-forest-900/70 backdrop-blur-sm rounded-lg p-6 border border-forest-800 flex flex-col md:flex-row gap-6"
                >
                  <div className="md:w-1/4">
                    <div className="text-lg font-bold text-leaf-400">{formatDate(yogaClass.scheduled_start_time)}</div>
                    <div className="text-2xl font-bold text-earth-100">{formatTime(yogaClass.scheduled_start_time)}</div>
                    <div className="mt-2 text-earth-300 text-sm">
                      {getTimeUntil(yogaClass.scheduled_start_time)} from now
                    </div>
                  </div>
                  
                  <div className="md:w-2/4">
                    <h3 className="text-xl font-bold text-earth-100">{yogaClass.yoga_class_type.name}</h3>
                    <p className="text-earth-300 mt-1">
                      {yogaClass.yoga_class_type.description || 'Join this yoga session led by ' + (yogaClass.yoga_class_type.instructor || 'Steven Zeiler')}
                    </p>
                    <div className="mt-2 text-earth-400 text-sm">
                      {yogaClass.yoga_class_type.duration_minutes} minutes
                    </div>
                  </div>
                  
                  <div className="md:w-1/4 flex flex-col justify-end items-start md:items-end space-y-2">
                    <button
                      onClick={async () => {
                        try {
                          // Set the registering state to show loading
                          setRegistering(yogaClass.id);
                          
                          if (!user) {
                            // Redirect to login if not logged in
                            router.push('/auth/sign-in?redirect=' + encodeURIComponent(`/yoga/scheduled?classId=${yogaClass.id}`));
                            return;
                          }
                          
                          // Track the event
                          trackEvent('join_class', {
                            classId: yogaClass.id,
                            className: yogaClass.yoga_class_type.name,
                            classTime: yogaClass.scheduled_start_time
                          });
                          
                          // Register user for the class
                          await registerForClass(yogaClass.id, {
                            userId: user.id,
                            userEmail: user.email,
                            userName: user.user_metadata?.full_name || user.email
                          });
                          
                          // Redirect to the class page
                          router.push(`/yoga/scheduled?classId=${yogaClass.id}`);
                        } catch (err) {
                          console.error('Error registering for class:', err);
                          setError('Failed to register for class. Please try again.');
                        } finally {
                          setRegistering(null);
                        }
                      }}
                      disabled={registering === yogaClass.id}
                      className={`bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors text-center w-full md:w-auto ${
                        registering === yogaClass.id ? 'opacity-75 cursor-wait' : ''
                      }`}
                    >
                      {registering === yogaClass.id ? 'Joining...' : 'Join Class'}
                    </button>
                    
                    <button
                      onClick={() => handleAddToCalendar(yogaClass)}
                      className="bg-forest-800 hover:bg-forest-700 text-earth-100 px-4 py-2 rounded transition-colors text-center w-full md:w-auto flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Add to Calendar
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <motion.div
            variants={fadeInUp} 
            initial="initial"
            animate="animate"
            className="text-center mt-12"
          >
            <Link 
              href="/"
              className="inline-block bg-forest-800 hover:bg-forest-700 text-earth-100 px-6 py-3 rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 