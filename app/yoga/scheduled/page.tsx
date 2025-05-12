'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import * as serviceWorker from '@/app/serviceWorkerRegistration';
import { 
  fetchScheduledClassById, 
  fetchNextScheduledClass 
} from '@/utils/supabase/yoga';
import { YogaScheduledClassWithType } from '@/types/yoga';
import { downloadICSFile } from '@/utils/icsGenerator';
import { trackEvent } from '@/utils/analytics';

interface YogaClass {
  id: string;
  title: string;
  description: string;
  scheduledTime: Date;
  audioUrl: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const yogaAudioMap = {
  'bikram-90-english': {
    title: '90-Minute Bikram Yoga (English)',
    description: 'Follow along with this 90-minute Bikram yoga class with English instructions.',
    url: 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//90-minute-hot-yoga-bikram-yoga-english-with-gary-olson%20(1).mp3'
  },
  'bikram-90': {
    title: '90-Minute Bikram Yoga',
    description: 'Follow along with the complete 90-minute Bikram sequence with detailed instructions.',
    url: 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//yoga_series_26_full_2024_06_18.mp3'
  },
  'bikram-30': {
    title: '30-Minute Express Bikram',
    description: 'A shorter version of the classic sequence for when you\'re short on time.',
    url: 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//Yoga+Practice+30+Mins.mp3'
  }
};

export default function ScheduledYogaClass() {
  const searchParams = useSearchParams();
  const { dictionary } = useLanguage();
  
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ 
    days: 0, hours: 0, minutes: 0, seconds: 0 
  });
  const [hasStarted, setHasStarted] = useState(false);
  const [yogaClass, setYogaClass] = useState<YogaClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  
  // Request audio permission early
  useEffect(() => {
    // Try to get audio context permission early
    const requestAudioPermission = async () => {
      try {
        // Create and immediately suspend a new AudioContext
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Create a silent oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0; // Silent
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play and immediately stop
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.001);
        
        setPermissionGranted(true);
      } catch (error) {
        console.log('Could not get audio permission:', error);
      }
    };
    
    requestAudioPermission();
  }, []);
  
  // Fetch yoga class data from Supabase
  useEffect(() => {
    async function fetchYogaClassData() {
      try {
        setIsLoading(true);
        
        // Get class ID from URL if available
        const classId = searchParams?.get('classId');
        let scheduledClass: YogaScheduledClassWithType | null = null;
        
        if (classId) {
          // Fetch specific class by ID
          scheduledClass = await fetchScheduledClassById(classId);
        } else {
          // Fetch next upcoming class
          scheduledClass = await fetchNextScheduledClass();
        }
        
        if (scheduledClass) {
          // Convert from database model to component model
          const yogaClassData: YogaClass = {
            id: scheduledClass.id,
            title: scheduledClass.yoga_class_type.name,
            description: scheduledClass.yoga_class_type.description || '',
            scheduledTime: new Date(scheduledClass.scheduled_start_time),
            audioUrl: scheduledClass.yoga_class_type.audio_url
          };
          
          setYogaClass(yogaClassData);
          
          // Check if class has already started
          if (new Date(scheduledClass.scheduled_start_time).getTime() <= Date.now()) {
            setHasStarted(true);
          }
        } else {
          // No scheduled class found - set to null
          setYogaClass(null);
        }
      } catch (error) {
        console.error('Error fetching yoga class data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchYogaClassData();
  }, [searchParams]);
  
  // Handle audio loading
  useEffect(() => {
    if (hasStarted && audioRef.current && !audioLoaded) {
      const handleCanPlay = () => {
        setAudioLoaded(true);
        tryPlayAudio();
      };
      
      audioRef.current.addEventListener('canplay', handleCanPlay);
      
      return () => {
        audioRef.current?.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [hasStarted, audioLoaded]);
  
  // Register service worker when component mounts
  useEffect(() => {
    if (yogaClass && !swRegistered && typeof window !== 'undefined') {
      serviceWorker.register(yogaClass.audioUrl, yogaClass.scheduledTime);
      setSwRegistered(true);
      
      // Listen for audio start events from service worker
      const handleAudioStart = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log('Yoga audio started via service worker', customEvent.detail);
        setHasStarted(true);
        
        // Try to play the audio element as a backup
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn('Backup audio play failed:', e));
        }
      };
      
      window.addEventListener('yogaAudioStart', handleAudioStart);
      
      return () => {
        window.removeEventListener('yogaAudioStart', handleAudioStart);
      };
    }
  }, [yogaClass, swRegistered]);
  
  // Function to try multiple audio play strategies
  const tryPlayAudio = () => {
    if (!audioRef.current) return;
    
    // Strategy 1: Simple play
    audioRef.current.play().catch(error => {
      console.warn('Simple play failed:', error);
      
      // Strategy 2: Play with user gesture simulation (not guaranteed to work)
      const playPromise = audioRef.current?.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Auto-play was prevented:', error);
          // At this point, show prominent play button to user
        });
      }
    });
  };
  
  // Countdown timer effect
  useEffect(() => {
    if (!yogaClass) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const scheduledTime = yogaClass.scheduledTime.getTime();
      const difference = scheduledTime - now;
      
      if (difference <= 0) {
        // Time has arrived - start the class
        setHasStarted(true);
        clearInterval(interval);
        
        // Play the audio automatically using multiple strategies
        if (audioRef.current) {
          tryPlayAudio();
        }
        
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
  }, [yogaClass]);
  
  const formatTimeUnit = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  // Handle adding to calendar
  const handleAddToCalendar = () => {
    if (!yogaClass) return;
    
    // Track the calendar download event
    trackEvent('calendar_download', {
      classId: yogaClass.id,
      className: yogaClass.title,
      scheduledTime: yogaClass.scheduledTime.toISOString(),
      source: 'scheduled_page'
    });
    
    // Calculate end time based on class duration
    const startTime = new Date(yogaClass.scheduledTime);
    const endTime = new Date(startTime);
    
    // If we have a duration in minutes, use it, otherwise default to 90 minutes
    const durationMinutes = 90; // Default duration
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    
    // Create event data
    const classUrl = typeof window !== 'undefined' 
      ? window.location.href 
      : `https://stevenzeiler.com/yoga/scheduled?classId=${yogaClass.id}`;
    
    // Download the .ics file
    downloadICSFile({
      title: `Yoga Class: ${yogaClass.title}`,
      description: yogaClass.description || `Join this yoga class with Steven Zeiler.`,
      location: 'Online',
      startTime,
      endTime,
      url: classUrl
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-950 text-earth-50">
        <div className="text-2xl">Loading scheduled class...</div>
      </div>
    );
  }

  if (!yogaClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-950 text-earth-50">
        <div className="text-center space-y-6">
          <div className="text-2xl">No scheduled class found</div>
          <Link 
            href="/yoga/scheduled/setup"
            className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-3 rounded-lg transition-colors"
          >
            Schedule a Class
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{yogaClass.title}</h1>
          <p className="text-xl md:text-2xl text-earth-300 max-w-3xl mx-auto">{yogaClass.description}</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {!hasStarted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12"
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-earth-100">Class Starts In</h2>
              
              <div className="grid grid-cols-4 gap-4 mb-10">
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-leaf-400">{formatTimeUnit(timeRemaining.days)}</div>
                  <div className="text-earth-300 text-sm uppercase tracking-wide">Days</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-leaf-400">{formatTimeUnit(timeRemaining.hours)}</div>
                  <div className="text-earth-300 text-sm uppercase tracking-wide">Hours</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-leaf-400">{formatTimeUnit(timeRemaining.minutes)}</div>
                  <div className="text-earth-300 text-sm uppercase tracking-wide">Minutes</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-leaf-400">{formatTimeUnit(timeRemaining.seconds)}</div>
                  <div className="text-earth-300 text-sm uppercase tracking-wide">Seconds</div>
                </div>
              </div>
              
              <div className="text-center text-earth-200 mb-6">
                <p>Scheduled to start on {yogaClass.scheduledTime.toLocaleDateString()} at {yogaClass.scheduledTime.toLocaleTimeString()}</p>
              </div>
              
              <div className="text-center">
                <p className="text-earth-300 text-sm md:text-base mb-6">
                  Get ready for your yoga practice! Make sure your space is prepared, and you have water and a yoga mat ready.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/yoga/scheduled/setup"
                    className="inline-block bg-forest-800 hover:bg-forest-700 text-earth-100 px-5 py-2 rounded-lg transition-colors text-sm"
                  >
                    Reschedule
                  </Link>
                  
                  <button
                    onClick={() => {
                      setPermissionGranted(true);
                      // Try to resume AudioContext as part of user interaction
                      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                      const audioContext = new AudioContext();
                      audioContext.resume();
                      
                      // Play a very short silent sound to get permission
                      const oscillator = audioContext.createOscillator();
                      const gainNode = audioContext.createGain();
                      gainNode.gain.value = 0; // Silent
                      oscillator.connect(gainNode);
                      gainNode.connect(audioContext.destination);
                      oscillator.start();
                      oscillator.stop(audioContext.currentTime + 0.001);
                    }}
                    className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-5 py-2 rounded-lg transition-colors text-sm"
                  >
                    Enable Audio
                  </button>
                  
                  <button
                    onClick={handleAddToCalendar}
                    className="inline-block bg-forest-800 hover:bg-forest-700 text-earth-100 px-5 py-2 rounded-lg transition-colors text-sm flex items-center"
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
                {permissionGranted && (
                  <div className="mt-4 text-leaf-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Audio permissions granted
                  </div>
                )}
                {swRegistered && (
                  <div className="mt-4 text-earth-300 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Automatic playback scheduled
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-forest-900/70 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12"
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-leaf-400">Your Class Has Started</h2>
              
              <div className="w-full mb-8">
                <audio 
                  ref={audioRef} 
                  controls 
                  className="w-full" 
                  autoPlay 
                  playsInline
                  muted={false}
                  preload="auto"
                  onCanPlay={() => audioRef.current?.play().catch(e => console.warn('Autoplay prevented:', e))}
                >
                  <source src={yogaClass?.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-earth-200">
                  Enjoy your practice! Follow along with the audio instructions.
                </p>
                <button 
                  onClick={() => audioRef.current?.play()} 
                  className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Play Audio
                </button>
                <p className="text-earth-300 text-sm">
                  If audio doesn't start automatically, click the play button above.
                </p>
              </div>
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