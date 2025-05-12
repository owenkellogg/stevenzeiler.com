'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-forest-900/80 backdrop-blur-sm rounded-lg border border-forest-800 shadow-xl p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-leaf-900/50 rounded-full flex items-center justify-center mb-6">
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
              className="text-leaf-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-earth-100 mb-4">Check your email</h2>
          <p className="text-earth-300 text-lg mb-8">
            We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
          </p>
          
          <div className="space-y-4">
            <p className="text-earth-400 text-sm">
              The verification link will expire in 24 hours. If you don't see the email, please check your spam folder.
            </p>
            
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center text-leaf-400 hover:text-leaf-300 transition-colors"
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
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Return to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 