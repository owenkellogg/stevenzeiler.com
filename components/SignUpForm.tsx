'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SignUpFormProps {
  redirectTo?: string;
}

export default function SignUpForm({ redirectTo = '/' }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

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
        router.push('/auth/verify-email');
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
        <h2 className="text-2xl font-bold text-earth-100">Create Account</h2>
        <p className="text-earth-300 mt-2">Join our yoga and meditation community</p>
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

      <form className="space-y-6" onSubmit={handleSignUp}>
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

        <div>
          <label className="block text-sm font-medium text-earth-200 mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-forest-900/70 border border-forest-700 rounded-md text-earth-100 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md text-earth-50 font-medium ${
              isLoading ? 'bg-leaf-700 cursor-not-allowed' : 'bg-leaf-600 hover:bg-leaf-700'
            } transition-colors shadow-sm`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="text-center">
            <p className="text-earth-300 text-sm">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-leaf-400 hover:text-leaf-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
} 