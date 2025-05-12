'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/' }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams ? searchParams.get('message') : null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(message);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Successfully signed in, redirect to specified page
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Check your email for the confirmation link');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-forest-900/80 backdrop-blur-sm rounded-lg border border-forest-800 shadow-xl p-8"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-earth-100">Welcome Back</h2>
        <p className="text-earth-300 mt-2">Sign in to access your yoga practice</p>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-earth-200 text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-earth-200 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-forest-900/70 border border-forest-700 rounded-md text-earth-100 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition-colors"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-200 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-forest-900/70 border border-forest-700 rounded-md text-earth-100 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            onClick={handleSignIn}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md text-earth-50 font-medium ${
              isLoading ? 'bg-leaf-700 cursor-not-allowed' : 'bg-leaf-600 hover:bg-leaf-700'
            } transition-colors shadow-sm`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <button
            type="button"
            onClick={handleSignUp}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md text-earth-200 font-medium ${
              isLoading ? 'bg-forest-800 cursor-not-allowed' : 'bg-forest-900 hover:bg-forest-800'
            } border border-forest-700 transition-colors shadow-sm`}
          >
            {isLoading ? 'Processing...' : 'Create account'}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-earth-300">
          <Link href="/" className="text-leaf-400 hover:text-leaf-300 transition-colors">
            Return to home page
          </Link>
        </div>
      </form>
    </motion.div>
  );
} 