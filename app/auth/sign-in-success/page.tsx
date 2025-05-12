'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SignInSuccess() {
  const [userName, setUserName] = useState<string | null>(null);
  const [redirectCounter, setRedirectCounter] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (redirectCounter <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCounter(redirectCounter - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCounter, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-forest-900/80 backdrop-blur-sm rounded-lg border border-forest-800 shadow-xl p-8 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-leaf-900/50 rounded-full flex items-center justify-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-leaf-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-earth-100 mb-4">Welcome back{userName ? `, ${userName}` : ''}!</h2>
          <p className="text-earth-300 text-lg mb-8">
            You've successfully signed in to your account.
          </p>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-earth-400">Redirecting to homepage in</div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-forest-800 text-earth-100 text-2xl font-bold">
                {redirectCounter}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-6 py-3 rounded-md transition-colors"
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
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Go to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 