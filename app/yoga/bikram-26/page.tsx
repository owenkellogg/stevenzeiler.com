'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { dictionaries } from '@/utils/i18n/dictionaries';
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

export default function Bikram26Page() {
  const { language } = useLanguage();
  const dict = dictionaries[language].bikram26;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 text-green-900 dark:text-green-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{dict.title}</h1>
          <p className="text-xl md:text-2xl text-green-700 dark:text-green-300">{dict.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">Practice</h2>
            <p className="mb-6">Follow along with the complete Bikram 26 sequence</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/yoga/bikram-26/practice"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all transform hover:scale-105"
              >
                {dict.practice?.startButton || "Start Practice"}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">Audio Guides</h2>
            <p className="mb-6">Listen to guided audio instructions for your practice</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-2">{dict.audioGuide.title}</h3>
                <p className="text-sm mb-3">{dict.audioGuide.description}</p>
                <audio controls className="w-full">
                  <source src="https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//yoga_series_26_full_2024_06_18.mp3" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="bg-green-50 dark:bg-green-700 rounded-lg p-4">
                <h3 className="font-bold mb-2">{dict.shortAudioGuide.title}</h3>
                <p className="text-sm mb-3">{dict.shortAudioGuide.description}</p>
                <audio controls className="w-full">
                  <source src="https://ufzfbwxnlcjxwpwdxjar.supabase.co/storage/v1/object/public/audio/bikram-45-english.mp3" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">{dict.benefits.title}</h2>
          <ul className="list-disc pl-5 space-y-2">
            {dict.benefits.items.map((benefit: string, index: number) => (
              <li key={index} className="text-lg">{benefit}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">{dict.tips.title}</h2>
          <ul className="list-disc pl-5 space-y-2">
            {dict.tips.items.map((tip: string, index: number) => (
              <li key={index} className="text-lg">{tip}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
} 