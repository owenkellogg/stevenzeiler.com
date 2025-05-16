'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { fetchPastYogaClasses } from '@/utils/supabase/yoga';
import { YogaScheduledClassWithType } from '@/types/yoga';
import { trackEvent } from '@/utils/analytics';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function YogaClassHistory() {
  const { dictionary } = useLanguage();
  const [pastClasses, setPastClasses] = useState<YogaScheduledClassWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Fetch past yoga classes
  useEffect(() => {
    async function loadPastClasses() {
      try {
        setIsLoading(true);
        const offset = page * ITEMS_PER_PAGE;
        const classes = await fetchPastYogaClasses(ITEMS_PER_PAGE + 1, offset);
        
        // Check if there are more classes
        if (classes.length > ITEMS_PER_PAGE) {
          setHasMore(true);
          setPastClasses(prevClasses => 
            page === 0 
              ? classes.slice(0, ITEMS_PER_PAGE) 
              : [...prevClasses, ...classes.slice(0, ITEMS_PER_PAGE)]
          );
        } else {
          setHasMore(false);
          setPastClasses(prevClasses => 
            page === 0 ? classes : [...prevClasses, ...classes]
          );
        }
      } catch (err) {
        console.error('Error fetching past yoga classes:', err);
        setError('Failed to load past classes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPastClasses();
  }, [page]);

  // Track page view
  useEffect(() => {
    trackEvent('page_view', { page: 'yoga_class_history' });
  }, []);

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

  // Load more classes
  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Your Yoga Class History</h1>
          <p className="text-xl md:text-2xl text-earth-300 max-w-3xl mx-auto">
            View your completed yoga sessions
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-earth-100">Past Classes</h2>
            <div className="flex gap-4">
              <Link
                href="/yoga/scheduled/list"
                className="bg-forest-800 hover:bg-forest-700 text-earth-50 px-4 py-2 rounded-lg transition-colors"
              >
                Upcoming Classes
              </Link>
              <Link
                href="/yoga/scheduled/setup"
                className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded-lg transition-colors"
              >
                Schedule New Class
              </Link>
            </div>
          </div>

          {isLoading && page === 0 ? (
            <div className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
              <p className="text-earth-200">Loading class history...</p>
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
          ) : pastClasses.length === 0 ? (
            <div className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
              <p className="text-earth-200 mb-4">No class history found</p>
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
              {pastClasses.map((yogaClass) => (
                <motion.div
                  key={yogaClass.id}
                  variants={fadeInUp}
                  className="bg-forest-900/70 backdrop-blur-sm rounded-lg p-6 border border-forest-800 flex flex-col md:flex-row gap-6"
                >
                  <div className="md:w-1/4">
                    <div className="text-lg font-bold text-leaf-400">{formatDate(yogaClass.scheduled_start_time)}</div>
                    <div className="text-2xl font-bold text-earth-100">{formatTime(yogaClass.scheduled_start_time)}</div>
                    <div className="mt-2 text-earth-300 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        yogaClass.status === 'completed' 
                          ? 'bg-green-900/50 text-green-200' 
                          : 'bg-blue-900/50 text-blue-200'
                      }`}>
                        {yogaClass.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:w-2/4">
                    <h3 className="text-xl font-bold text-earth-100">{yogaClass.yoga_class_type.name}</h3>
                    <p className="text-earth-300 mt-1">
                      {yogaClass.yoga_class_type.description || 'Yoga session led by ' + (yogaClass.yoga_class_type.instructor || 'Steven Zeiler')}
                    </p>
                    <div className="mt-2 text-earth-400 text-sm">
                      {yogaClass.yoga_class_type.duration_minutes} minutes
                    </div>
                  </div>
                  
                  <div className="md:w-1/4 flex flex-col justify-center items-start md:items-end space-y-3">
                    <Link
                      href={`/yoga/scheduled?classId=${yogaClass.id}`}
                      className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded-lg transition-colors text-sm w-full md:w-auto text-center"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => {
                        // Track the replay event
                        trackEvent('class_replay', {
                          classId: yogaClass.id,
                          className: yogaClass.yoga_class_type.name,
                          classType: yogaClass.yoga_class_type.yoga_type,
                          source: 'history_page'
                        });
                        // Navigate to class page
                        window.location.href = `/yoga/scheduled?classId=${yogaClass.id}`;
                      }}
                      className="bg-forest-800 hover:bg-forest-700 text-earth-100 px-4 py-2 rounded-lg transition-colors text-sm w-full md:w-auto"
                    >
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Replay Session
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg text-earth-50 transition-colors ${
                      isLoading 
                        ? 'bg-forest-800 cursor-not-allowed' 
                        : 'bg-leaf-600 hover:bg-leaf-700'
                    }`}
                  >
                    {isLoading ? 'Loading...' : 'Load More Classes'}
                  </button>
                </div>
              )}
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
