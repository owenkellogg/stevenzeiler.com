'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/LoginForm';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams?.get('message');

  useEffect(() => {
    // Redirect to the new auth path
    router.replace(`/auth/sign-in${message ? `?message=${encodeURIComponent(message)}` : ''}`);
  }, [router, message]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md text-center text-earth-200"
      >
        <div className="p-8 rounded-lg bg-forest-900/50 backdrop-blur-sm border border-forest-800">
          <h2 className="text-xl font-medium mb-4">Redirecting to sign in...</h2>
          <div className="w-16 h-16 border-t-2 border-leaf-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-earth-300">
            If you are not redirected, please{' '}
            <Link href="/auth/sign-in" className="text-leaf-400 hover:text-leaf-300">
              click here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
