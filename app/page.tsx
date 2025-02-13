'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import HeroGallery from '@/components/HeroGallery';
import { useLanguage } from '@/utils/i18n/LanguageProvider';

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
  const { dictionary } = useLanguage();
  const t = dictionary.home;

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50">
      {/* Hero Section */}
      <HeroGallery />

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
          <h2 className="text-3xl font-bold text-earth-100">{t.meditationTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zen Meditation */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.zenMeditation.title}</h3>
              <p className="text-earth-300">{t.zenMeditation.description}</p>
              <button className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.zenMeditation.cta}
              </button>
            </div>

            {/* Philosophical Experiences */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.philosophicalExperiences.title}</h3>
              <p className="text-earth-300">{t.philosophicalExperiences.description}</p>
              <button className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.philosophicalExperiences.cta}
              </button>
            </div>

            {/* Training Programs */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.trainingPrograms.title}</h3>
              <p className="text-earth-300">{t.trainingPrograms.description}</p>
              <button className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.trainingPrograms.cta}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Yoga Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-earth-100">{t.yogaTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bikram Yoga */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.bikramYoga.title}</h3>
              <p className="text-earth-300">{t.bikramYoga.description}</p>
              <Link href="/yoga/bikram-26" className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.bikramYoga.cta}
              </Link>
            </div>

            {/* Senior Yoga */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.seniorYoga.title}</h3>
              <p className="text-earth-300">{t.seniorYoga.description}</p>
              <button className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.seniorYoga.cta}
              </button>
            </div>

            {/* General Yoga */}
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
              <h3 className="text-xl font-semibold text-earth-100">{t.generalYoga.title}</h3>
              <p className="text-earth-300">{t.generalYoga.description}</p>
              <button className="bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                {t.generalYoga.cta}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Additional Images */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-earth-100">{t.imagesTitle}</h2>
          <ImageGallery />
        </motion.section>

        {/* Join Section */}
        <motion.section
          variants={fadeInUp}
          className="text-center space-y-6 py-12"
        >
          <h2 className="text-3xl font-bold text-earth-100">{t.joinCommunity.title}</h2>
          <p className="text-xl text-earth-200 max-w-2xl mx-auto">
            {t.joinCommunity.description}
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            {t.joinCommunity.cta}
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
