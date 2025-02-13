'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] flex items-center justify-center bg-gradient-to-b from-blue-900 to-gray-950"
      >
        <div className="text-center space-y-4 p-4">
          <motion.h1
            {...fadeInUp}
            className="text-4xl md:text-6xl font-bold"
          >
            Steven Zeiler
          </motion.h1>
          <motion.p
            {...fadeInUp}
            className="text-xl md:text-2xl text-gray-300"
          >
            Meditation & Yoga Guide
          </motion.p>
        </div>
      </motion.section>

      {/* Content Sections */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-4 py-16 space-y-20"
      >
        {/* Meditation Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold">Meditation Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zen Meditation */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Zen Meditation</h3>
              <p className="text-gray-400">Discover the art of mindfulness and presence through Zen meditation practices.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Watch Guide
              </button>
            </div>

            {/* Philosophical Experiences */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Philosophical Experiences</h3>
              <p className="text-gray-400">Explore deep insights and transformative experiences through meditation.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Listen Now
              </button>
            </div>

            {/* Training Programs */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Training Programs</h3>
              <p className="text-gray-400">Structured programs to deepen your meditation practice.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Join Program
              </button>
            </div>
          </div>
        </motion.section>

        {/* Yoga Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold">Yoga Practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bikram Yoga */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Bikram Yoga</h3>
              <p className="text-gray-400">Experience the transformative power of hot yoga practice.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Start Practice
              </button>
            </div>

            {/* Senior Yoga */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Yoga for Seniors</h3>
              <p className="text-gray-400">Gentle and effective yoga practices adapted for seniors.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                View Classes
              </button>
            </div>

            {/* General Yoga */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">General Yoga</h3>
              <p className="text-gray-400">Comprehensive yoga practices for all skill levels.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Explore
              </button>
            </div>
          </div>
        </motion.section>

        {/* Join Section */}
        <motion.section
          variants={fadeInUp}
          className="text-center space-y-6 py-12"
        >
          <h2 className="text-3xl font-bold">Join Our Community</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Begin your journey of self-discovery and transformation with our meditation and yoga practices.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
          >
            Get Started
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
