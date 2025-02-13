'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';

interface ImageData {
  name: string;
  url: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const container = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ImageGallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchImages() {
      try {
        console.log('Fetching images from bucket...');
        const { data: files, error: listError } = await supabase
          .storage
          .from('public-images-yoga-meditation')
          .list();

        if (listError) {
          console.error('Error listing files:', listError);
          setError('Failed to list images');
          setIsLoading(false);
          return;
        }

        console.log('Files found:', files);

        if (!files || files.length === 0) {
          console.log('No files found in bucket');
          setError('No images found');
          setIsLoading(false);
          return;
        }

        const imageUrls = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase
              .storage
              .from('public-images-yoga-meditation')
              .getPublicUrl(file.name);

            console.log(`Generated URL for ${file.name}:`, publicUrl);

            return {
              name: file.name,
              url: publicUrl,
            };
          })
        );

        console.log('Processed image URLs:', imageUrls);
        setImages(imageUrls);
        setIsLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    }

    fetchImages();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-earth-400">Loading images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-earth-400">{error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-earth-400">No images available</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="initial"
      animate="animate"
      className="relative w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {images.map((image, index) => {
          // Calculate dynamic styles for each image
          const isLarge = index % 5 === 0;
          const isWide = index % 7 === 0;
          const isTall = index % 3 === 0;

          return (
            <motion.div
              key={image.name}
              variants={fadeInUp}
              className={`relative overflow-hidden rounded-lg shadow-xl ${
                isLarge
                  ? 'md:col-span-2 md:row-span-2'
                  : isWide
                  ? 'md:col-span-2'
                  : isTall
                  ? 'row-span-2'
                  : ''
              }`}
              style={{
                height: isLarge ? '500px' : isTall ? '600px' : '300px',
              }}
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  console.error(`Error loading image: ${image.url}`);
                  e.currentTarget.src = '/placeholder.jpg'; // Fallback image
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 