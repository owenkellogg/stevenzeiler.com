'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check current auth status
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  // Don't show anything while loading to prevent UI flashing
  if (isLoading) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          className="w-10 h-10 rounded-full bg-forest-800/80 backdrop-blur-sm flex items-center justify-center text-earth-100 hover:bg-forest-700/80 transition-colors border border-forest-700/50 shadow-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={user ? "User menu" : "Sign in"}
        >
          {user ? (
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
              {user.user_metadata.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.email || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-earth-100 font-semibold text-sm">
                  {(user.email || user.user_metadata.name || 'User').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-forest-800/90 backdrop-blur-sm border border-forest-700/50 overflow-hidden"
            >
              <div className="p-2">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-forest-700/50">
                      <p className="text-sm text-earth-300">Signed in as</p>
                      <p className="text-sm font-medium text-earth-100 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/account" 
                        className="block px-4 py-2 text-sm text-earth-200 hover:bg-forest-700/50 rounded-md hover:text-earth-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-earth-200 hover:bg-forest-700/50 rounded-md hover:text-earth-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link 
                      href="/login"
                      className="block px-4 py-2 text-sm text-earth-200 hover:bg-forest-700/50 rounded-md hover:text-earth-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/auth/sign-up"
                      className="block px-4 py-2 text-sm text-earth-200 hover:bg-forest-700/50 rounded-md hover:text-earth-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 