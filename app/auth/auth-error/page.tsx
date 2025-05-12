'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-forest-900/80 backdrop-blur-sm rounded-lg border border-forest-800 shadow-xl p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6">
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
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-earth-100 mb-4">Authentication Error</h2>
          <p className="text-earth-300 text-lg mb-6">
            There was a problem authenticating your account. This could be because:
          </p>
          <ul className="text-earth-300 text-left list-disc list-inside space-y-2 mb-8">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>There was a technical problem</li>
          </ul>
          
          <div className="space-y-6">
            <p className="text-earth-400">
              Please try signing in again or contact support if the problem persists.
            </p>
            
            <div className="flex justify-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-3 rounded-md transition-colors"
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
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                </svg>
                Return to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 