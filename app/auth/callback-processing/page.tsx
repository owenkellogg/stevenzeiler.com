'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CallbackProcessing() {
  const [progress, setProgress] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/';

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    // Show fallback option after 10 seconds
    const fallbackTimeout = setTimeout(() => {
      setShowFallback(true);
    }, 10000);

    // Cleanup
    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Redirect to next page when progress is complete
  useEffect(() => {
    if (progress === 100) {
      // Add a small delay before redirecting
      const timeout = setTimeout(() => {
        router.push(next);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, router, next]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-forest-900/80 backdrop-blur-sm rounded-lg border border-forest-800 shadow-xl p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-forest-700"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-leaf-500 animate-pulse"
              style={{ 
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)` 
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-leaf-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-earth-100 mb-4">Verifying your account</h2>
          <p className="text-earth-300 mb-8">
            Please wait while we authenticate your account. You'll be redirected shortly.
          </p>
          
          <div className="w-full bg-forest-800 h-2 rounded-full mb-6 overflow-hidden">
            <motion.div 
              className="h-full bg-leaf-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
          
          {showFallback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-4"
            >
              <p className="text-earth-400 text-sm">
                Taking longer than expected? You can try manually continuing to your destination.
              </p>
              <div className="flex justify-center">
                <Link
                  href={next}
                  className="inline-flex items-center bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-2 rounded-md transition-colors"
                >
                  Continue to {next === '/' ? 'Home' : next}
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 