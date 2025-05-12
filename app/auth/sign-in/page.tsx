'use client';

import { motion } from 'framer-motion';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function SignIn() {
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
              
              <h1 className="text-4xl font-bold text-earth-100 mb-4">Welcome Back</h1>
              <p className="text-xl text-earth-300 mb-8">
                Sign in to access your yoga and meditation practices
              </p>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2 p-4">
            <LoginForm redirectTo="/" />
          </div>
        </div>
      </div>
    </div>
  );
} 