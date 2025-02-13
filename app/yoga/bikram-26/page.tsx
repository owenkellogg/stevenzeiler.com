'use client';

import { motion } from 'framer-motion';
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

export default function Bikram26Page() {
  const { dictionary } = useLanguage();
  const t = dictionary.bikram26;

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950 text-earth-50">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto px-4 py-16 space-y-12"
      >
        {/* Header Section */}
        <motion.section variants={fadeInUp} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-100">{t.title}</h1>
          <p className="text-xl text-earth-200">{t.subtitle}</p>
        </motion.section>

        {/* Audio Player Section */}
        <motion.section variants={fadeInUp} className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
          <h2 className="text-2xl font-semibold text-earth-100">{t.audioGuide.title}</h2>
          <p className="text-earth-300 mb-4">{t.audioGuide.description}</p>
          <div className="w-full">
            <audio 
              controls 
              className="w-full"
              controlsList="nodownload"
            >
              <source 
                src="https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//yoga_series_26_full_2024_06_18.mp3" 
                type="audio/mpeg" 
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        </motion.section>

        {/* Information Section */}
        <motion.section variants={fadeInUp} className="space-y-8">
          <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800">
            <h2 className="text-2xl font-semibold text-earth-100 mb-4">{t.about.title}</h2>
            <div className="space-y-4 text-earth-200">
              <p>{t.about.description1}</p>
              <p>{t.about.description2}</p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800">
            <h2 className="text-2xl font-semibold text-earth-100 mb-4">{t.benefits.title}</h2>
            <ul className="list-disc list-inside space-y-2 text-earth-200">
              {t.benefits.items.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          {/* Practice Tips */}
          <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 border border-forest-800">
            <h2 className="text-2xl font-semibold text-earth-100 mb-4">{t.tips.title}</h2>
            <ul className="list-disc list-inside space-y-2 text-earth-200">
              {t.tips.items.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
} 