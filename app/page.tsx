'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import HeroGallery from '@/components/HeroGallery';
import UpcomingClassBanner from '@/components/UpcomingClassBanner';
import { useLanguage } from '@/utils/i18n/LanguageProvider';

interface ImageData {
  name: string;
  url: string;
}

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
  const [images, setImages] = useState<ImageData[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data: files, error: listError } = await supabase
          .storage
          .from('public-images-yoga-meditation')
          .list();

        if (!listError && files && files.length > 0) {
          const imageUrls = await Promise.all(
            files.map(async (file) => {
              const { data: { publicUrl } } = supabase
                .storage
                .from('public-images-yoga-meditation')
                .getPublicUrl(file.name);

              return {
                name: file.name,
                url: publicUrl,
              };
            })
          );
          setImages(imageUrls);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
      }
    }

    fetchImages();
  }, [supabase]);

  // Function to get random images from the image collection
  const getRandomImages = (count: number) => {
    if (images.length === 0) return [];
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

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
        {/* Upcoming Class Banner */}
        <UpcomingClassBanner />
        
        {/* Featured Bikram Yoga Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-earth-100">Bikram Yoga Audio Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-6 border border-forest-800">
              <h3 className="text-2xl font-semibold text-earth-100">90-Minute Full Bikram 26 Sequence</h3>
              <p className="text-earth-300">Follow along with the complete 90-minute Bikram sequence with detailed instructions.</p>
              <div className="w-full">
                <audio controls className="w-full">
                  <source src="https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//yoga_series_26_full_2024_06_18.mp3" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/yoga/bikram-26" className="inline-block bg-leaf-600 hover:bg-leaf-700 text-earth-50 px-4 py-2 rounded transition-colors">
                  View Full Class Details
                </Link>
                <Link href="/yoga/scheduled/setup" className="inline-block bg-forest-800 hover:bg-forest-700 text-earth-50 px-4 py-2 rounded transition-colors">
                  Schedule a Class
                </Link>
                <Link href="/yoga/scheduled/list" className="inline-block bg-forest-800 hover:bg-forest-700 text-earth-50 px-4 py-2 rounded transition-colors">
                  View Schedule
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
                <h3 className="text-xl font-semibold text-earth-100">30-Minute Express Bikram</h3>
                <p className="text-earth-300">A shorter version of the classic sequence for when you're short on time.</p>
                <div className="w-full">
                  <audio controls className="w-full">
                    <source src="https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//Yoga+Practice+30+Mins.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>

              <div className="bg-forest-900/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-forest-800">
                <h3 className="text-xl font-semibold text-earth-100">90-Minute English Bikram Yoga</h3>
                <p className="text-earth-300">Full-length Bikram class with English instructions.</p>
                <div className="w-full">
                  <audio controls className="w-full">
                    <source src="https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//90-minute-hot-yoga-bikram-yoga-english-with-gary-olson%20(1).mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          </div>

          {/* Image row interspersed */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {getRandomImages(4).map((image, index) => (
                <motion.div
                  key={`featured-${index}`}
                  variants={fadeInUp}
                  className="relative rounded-lg overflow-hidden h-40 md:h-60"
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Meditation Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-earth-100">{t.meditationTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Image row interspersed */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {getRandomImages(3).map((image, index) => (
                <motion.div
                  key={`meditation-${index}`}
                  variants={fadeInUp}
                  className="relative rounded-lg overflow-hidden h-60 md:h-80"
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Additional Yoga Section */}
        <motion.section
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-earth-100">{t.yogaTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Add a visually appealing image card */}
            {images.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="relative rounded-lg overflow-hidden border border-forest-800"
              >
                <img
                  src={images[0]?.url || ''}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-semibold text-earth-100">Explore Our Practice</h3>
                </div>
              </motion.div>
            )}
          </div>

          {/* Image row interspersed */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {getRandomImages(4).map((image, index) => (
                <motion.div
                  key={`yoga-${index}`}
                  variants={fadeInUp}
                  className={`relative rounded-lg overflow-hidden ${index % 2 === 0 ? 'h-40 md:h-60' : 'h-60 md:h-80'}`}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          )}
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
