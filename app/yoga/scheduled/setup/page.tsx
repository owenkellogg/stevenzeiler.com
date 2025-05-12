'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { fetchYogaClassTypes, createScheduledClass } from '@/utils/supabase/yoga';
import { YogaClassType } from '@/types/yoga';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ScheduleSetup() {
  const router = useRouter();
  const { dictionary } = useLanguage();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [classTypes, setClassTypes] = useState<YogaClassType[]>([]);
  const [selectedClassTypeId, setSelectedClassTypeId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch class types from Supabase
  useEffect(() => {
    async function loadClassTypes() {
      try {
        setIsLoading(true);
        const types = await fetchYogaClassTypes();
        setClassTypes(types);
        
        // Set default selection to first class type if available
        if (types.length > 0) {
          setSelectedClassTypeId(types[0].id);
        }
      } catch (err) {
        console.error('Error fetching yoga class types:', err);
        setError('Failed to load yoga class types. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadClassTypes();
  }, []);

  // Get today's date in YYYY-MM-DD format for the default value
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!date || !time || !selectedClassTypeId) {
      setError('Please select a class type, date, and time');
      return;
    }
    
    // Create a Date object from the selected date and time
    const scheduledDateTime = new Date(`${date}T${time}`);
    
    // Check if the scheduled time is in the past
    if (scheduledDateTime.getTime() <= Date.now()) {
      setError('Please schedule a time in the future');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the scheduled class in Supabase
      const newClass = await createScheduledClass(
        selectedClassTypeId, 
        scheduledDateTime,
        {
          isPublic: true
        }
      );
      
      // Redirect to the countdown page with the scheduled class ID
      router.push(`/yoga/scheduled?classId=${newClass.id}`);
    } catch (err) {
      console.error('Error scheduling class:', err);
      setError('Failed to schedule the class. Please try again.');
      setIsSubmitting(false);
    }
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Schedule Your Yoga Class</h1>
          <p className="text-xl md:text-2xl text-earth-300 max-w-3xl mx-auto">
            Set a date and time for your next yoga practice. The audio will automatically play when it's time.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12"
          >
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="text-earth-200 text-lg">Loading class options...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-earth-200 text-lg mb-2 block">Select Yoga Class</span>
                    <select
                      value={selectedClassTypeId}
                      onChange={(e) => setSelectedClassTypeId(e.target.value)}
                      className="w-full bg-forest-800 border border-forest-700 rounded-lg p-3 text-earth-100 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500"
                      disabled={isSubmitting}
                      required
                    >
                      {classTypes.map(classType => (
                        <option key={classType.id} value={classType.id}>
                          {classType.name} ({classType.duration_minutes} minutes)
                        </option>
                      ))}
                    </select>
                  </label>
                  
                  <label className="block">
                    <span className="text-earth-200 text-lg mb-2 block">Date</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={getTodayDate()}
                      className="w-full bg-forest-800 border border-forest-700 rounded-lg p-3 text-earth-100 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500"
                      disabled={isSubmitting}
                      required
                    />
                  </label>
                  
                  <label className="block">
                    <span className="text-earth-200 text-lg mb-2 block">Time</span>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-forest-800 border border-forest-700 rounded-lg p-3 text-earth-100 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500"
                      disabled={isSubmitting}
                      required
                    />
                  </label>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className={`w-full ${isSubmitting ? 'bg-leaf-800' : 'bg-leaf-600 hover:bg-leaf-700'} text-earth-50 px-6 py-3 rounded-lg text-lg font-semibold transition-colors flex justify-center items-center`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Class'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
          
          <motion.div
            variants={fadeInUp} 
            initial="initial"
            animate="animate"
            className="text-center mt-8"
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