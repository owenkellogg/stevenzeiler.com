'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classesAttended, setClassesAttended] = useState(0);
  const [nextClass, setNextClass] = useState<any>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/sign-in');
          return;
        }
        
        setUser(user);

        // Get user's class participation stats - this might fail if the table doesn't exist yet
        try {
          const { count: attendedCount } = await supabase
            .from('yoga_class_participants')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id);
          
          if (attendedCount !== null) {
            setClassesAttended(attendedCount);
          }

          // Get next upcoming class the user is registered for
          const now = new Date().toISOString();
          const { data: upcomingClass } = await supabase
            .from('yoga_scheduled_classes')
            .select(`
              id,
              scheduled_start_time,
              yoga_class_type (
                name,
                duration_minutes
              ),
              yoga_class_participants (
                id
              )
            `)
            .eq('yoga_class_participants.user_id', user.id)
            .gt('scheduled_start_time', now)
            .order('scheduled_start_time', { ascending: true })
            .limit(1)
            .single();

          setNextClass(upcomingClass);
        } catch (err) {
          console.log('Error fetching class data - might not be set up yet');
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-leaf-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-earth-200 hover:text-leaf-400 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center bg-forest-800 hover:bg-forest-700 text-earth-200 px-4 py-2 rounded-md transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>

        <motion.div 
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
          className="bg-forest-900/80 backdrop-blur-sm rounded-xl p-6 border border-forest-800 mb-8 flex flex-col md:flex-row items-start gap-6"
        >
          <div className="flex-shrink-0 w-20 h-20 bg-forest-800 rounded-full flex items-center justify-center text-2xl font-bold text-earth-100">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-earth-100 mb-2">My Account</h1>
            <div className="text-earth-300 space-y-2">
              <p><span className="text-earth-400">Email: </span>{user?.email}</p>
              <p><span className="text-earth-400">Member since: </span>{new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
            className="bg-forest-900/80 backdrop-blur-sm rounded-xl p-6 border border-forest-800"
          >
            <div className="flex items-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-leaf-400 mr-3"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h2 className="text-xl font-bold text-earth-100">Your Stats</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-forest-800/50 rounded-lg p-4">
                <p className="text-earth-400 text-sm mb-1">Classes Attended</p>
                <p className="text-3xl font-bold text-earth-100">{classesAttended}</p>
              </div>
              <div className="bg-forest-800/50 rounded-lg p-4">
                <p className="text-earth-400 text-sm mb-1">Practice Minutes</p>
                <p className="text-3xl font-bold text-earth-100">{classesAttended * 90}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
            className="bg-forest-900/80 backdrop-blur-sm rounded-xl p-6 border border-forest-800"
          >
            <div className="flex items-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-leaf-400 mr-3"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h2 className="text-xl font-bold text-earth-100">Upcoming Classes</h2>
            </div>
            {nextClass ? (
              <div className="bg-forest-800/50 rounded-lg p-4">
                <p className="text-earth-400 text-sm mb-1">Next Class</p>
                <p className="text-lg font-medium text-earth-100">{nextClass.yoga_class_type.name}</p>
                <p className="text-earth-300">{formatDate(nextClass.scheduled_start_time)}</p>
                <Link 
                  href="/yoga/scheduled/list" 
                  className="mt-3 inline-block text-sm text-leaf-400 hover:text-leaf-300"
                >
                  View all classes →
                </Link>
              </div>
            ) : (
              <div className="bg-forest-800/50 rounded-lg p-4 text-center">
                <p className="text-earth-300 mb-3">No upcoming classes scheduled</p>
                <Link 
                  href="/yoga/scheduled/list" 
                  className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors text-sm"
                >
                  Browse Classes
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
          className="bg-forest-900/80 backdrop-blur-sm rounded-xl p-6 border border-forest-800"
        >
          <div className="flex items-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-leaf-400 mr-3"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <h2 className="text-xl font-bold text-earth-100">Recommended Practices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/yoga/bikram-26" className="block bg-forest-800/50 hover:bg-forest-700/50 rounded-lg p-4 transition-colors">
              <h3 className="font-medium text-earth-100 mb-1">Bikram 26</h3>
              <p className="text-sm text-earth-300">90-minute complete sequence</p>
            </Link>
            <Link href="/yoga/bikram-26" className="block bg-forest-800/50 hover:bg-forest-700/50 rounded-lg p-4 transition-colors">
              <h3 className="font-medium text-earth-100 mb-1">Express Bikram</h3>
              <p className="text-sm text-earth-300">30-minute quick sequence</p>
            </Link>
            <Link href="/yoga/bikram-26" className="block bg-forest-800/50 hover:bg-forest-700/50 rounded-lg p-4 transition-colors">
              <h3 className="font-medium text-earth-100 mb-1">Meditation</h3>
              <p className="text-sm text-earth-300">15-minute guided meditation</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 