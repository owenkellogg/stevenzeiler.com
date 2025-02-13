'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg text-center"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Check your email</h2>
          <p className="text-gray-400">
            We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/sign-in"
              className="text-blue-500 hover:text-blue-400"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 