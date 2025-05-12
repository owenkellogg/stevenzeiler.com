'use client';

import { motion } from 'framer-motion';
import SignUpForm from '@/components/SignUpForm';
import Link from 'next/link';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                href="/" 
                className="inline-flex items-center text-earth-200 hover:text-leaf-400 mb-8 transition-colors"
              >
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
                  className="mr-2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              
              <h1 className="text-4xl font-bold text-earth-100 mb-4">Join Our Community</h1>
              <p className="text-xl text-earth-300 mb-8">
                Create an account to track your yoga practice and join our meditation sessions
              </p>

              <div className="space-y-6 text-earth-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-1 bg-leaf-900/50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-leaf-400">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-earth-100 font-medium">Schedule Yoga Classes</h3>
                    <p className="text-sm">Join scheduled classes that sync with your calendar</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-1 bg-leaf-900/50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-leaf-400">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-earth-100 font-medium">Track Your Progress</h3>
                    <p className="text-sm">Monitor your meditation and yoga journey</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2 p-4">
            <SignUpForm redirectTo="/" />
          </div>
        </div>
      </div>
    </div>
  );
} 