'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchNextScheduledClass } from '@/utils/supabase/yoga';
import { YogaScheduledClassWithType } from '@/types/yoga';
import { downloadICSFile } from '@/utils/icsGenerator';
import { trackEvent } from '@/utils/analytics';

export default function UpcomingClassBanner() {
  const [nextClass, setNextClass] = useState<YogaScheduledClassWithType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  // Fetch the next scheduled class
  useEffect(() => {
    async function loadNextClass() {
      try {
        setIsLoading(true);
        const classData = await fetchNextScheduledClass();
        setNextClass(classData);
      } catch (err) {
        console.error('Error fetching next class:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadNextClass();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextClass) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const scheduledTime = new Date(nextClass.scheduled_start_time).getTime();
      const difference = scheduledTime - now;

      if (difference <= 0) {
        // Class has started
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextClass]);

  const formatTimeUnit = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
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

  // Function to generate and download the .ics calendar file
  const handleAddToCalendar = () => {
    if (!nextClass) return;
    
    // Track the calendar download event
    trackEvent('calendar_download', {
      classId: nextClass.id,
      className: nextClass.yoga_class_type.name,
      classType: nextClass.yoga_class_type.yoga_type,
      scheduledTime: nextClass.scheduled_start_time,
      source: 'home_banner',
      duration: nextClass.yoga_class_type.duration_minutes
    });
    
    // Calculate end time (duration in minutes)
    const startTime = new Date(nextClass.scheduled_start_time);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + nextClass.yoga_class_type.duration_minutes);
    
    // Create event data
    const classUrl = `${window.location.origin}/yoga/scheduled?classId=${nextClass.id}`;
    
    // Download the .ics file
    downloadICSFile({
      title: `Yoga Class: ${nextClass.yoga_class_type.name}`,
      description: nextClass.yoga_class_type.description || 
        `Join this ${nextClass.yoga_class_type.duration_minutes}-minute yoga class with ${nextClass.yoga_class_type.instructor || 'Steven Zeiler'}.`,
      location: 'Online',
      startTime,
      endTime,
      url: classUrl
    });
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!nextClass) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        className="hidden" // This ensures it takes no space when no class is found
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-forest-900/80 to-leaf-900/80 backdrop-blur-sm rounded-lg border border-leaf-700/50 p-4 md:p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-earth-100">
            Next Yoga Class: {nextClass.yoga_class_type.name}
          </h3>
          <p className="text-earth-300 text-sm md:text-base">
            {formatDate(nextClass.scheduled_start_time)} at {formatTime(nextClass.scheduled_start_time)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:grid grid-cols-4 gap-2 px-2 py-1 bg-forest-950/30 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-leaf-400">{formatTimeUnit(timeRemaining.days)}</div>
              <div className="text-earth-400 text-xs">days</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-leaf-400">{formatTimeUnit(timeRemaining.hours)}</div>
              <div className="text-earth-400 text-xs">hrs</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-leaf-400">{formatTimeUnit(timeRemaining.minutes)}</div>
              <div className="text-earth-400 text-xs">min</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-leaf-400">{formatTimeUnit(timeRemaining.seconds)}</div>
              <div className="text-earth-400 text-xs">sec</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link 
              href={`/yoga/scheduled?classId=${nextClass.id}`}
              className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Join Class
            </Link>
            
            <button
              onClick={handleAddToCalendar}
              className="bg-forest-800 hover:bg-forest-700 text-earth-100 px-4 py-2 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap flex items-center justify-center"
              title="Add to calendar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 