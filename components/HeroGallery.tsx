'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useLanguage } from '@/utils/i18n/LanguageProvider';

interface ImageData {
  name: string;
  url: string;
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

export default function HeroGallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { dictionary } = useLanguage();
  const t = dictionary.home;

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
        console.error('Error fetching hero images:', err);
      }
    }

    fetchImages();
  }, [supabase]);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [images.length]);

  return (
    <div className="relative h-[40vh] overflow-hidden">
      {/* Background Image */}
      {images.length > 0 && (
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={images[currentImageIndex].url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 to-earth-950/70" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="flex flex-col md:flex-row items-center justify-between gap-8"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6 }}
            >
              {/* Text Content */}
              <div className="text-center md:text-left md:flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-earth-100 mb-4">
                  {t.title}
                </h1>
                <p className="text-xl text-earth-200">
                  {t.subtitle}
                </p>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-4 md:flex-1">
                {images.slice(0, 4).map((image, index) => (
                  <motion.div
                    key={image.name}
                    className="relative aspect-square rounded-lg overflow-hidden"
                    variants={{
                      initial: { opacity: 0, scale: 0.8 },
                      animate: { opacity: 1, scale: 1 },
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 