'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg text-center"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Authentication Error</h2>
          <p className="text-gray-400">
            There was a problem authenticating your account. This could be because:
          </p>
          <ul className="text-gray-400 text-left list-disc list-inside space-y-2">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>There was a technical problem</li>
          </ul>
          <div className="mt-8 space-y-4">
            <p className="text-gray-400">
              Please try signing in again or contact support if the problem persists.
            </p>
            <Link
              href="/auth/sign-in"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 