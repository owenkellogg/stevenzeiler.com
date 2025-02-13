'use client';

import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

// Sample data - in a real app, this would come from your database
const currentResidences = [
  {
    id: 1,
    name: 'Zen Mountain Monastery',
    location: 'Mount Tremper, NY',
    description: 'A peaceful monastery in the Catskill Mountains',
    images: ['/monastery1.jpg', '/monastery2.jpg', '/monastery3.jpg'],
    capacity: 50,
    amenities: ['Meditation Hall', 'Gardens', 'Library']
  },
  {
    id: 2,
    name: 'Coastal Retreat Center',
    location: 'Big Sur, CA',
    description: 'Ocean-side meditation and yoga center',
    images: ['/retreat1.jpg', '/retreat2.jpg'],
    capacity: 30,
    amenities: ['Yoga Studio', 'Beach Access', 'Dining Hall']
  }
];

const targetResidences = [
  {
    id: 3,
    name: 'Forest Meditation Center',
    location: 'Portland, OR',
    description: 'Proposed center in the Pacific Northwest',
    images: ['/target1.jpg'],
    estimatedCost: '$2.5M',
    targetDate: '2024'
  },
  {
    id: 4,
    name: 'Desert Sanctuary',
    location: 'Sedona, AZ',
    description: 'Future retreat in the red rocks',
    images: ['/target2.jpg'],
    estimatedCost: '$3.1M',
    targetDate: '2025'
  }
];

export default function ResidencesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'me@stevenzeiler.com') {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-12"
      >
        {/* Current Residences */}
        <motion.section variants={fadeInUp}>
          <h2 className="text-3xl font-bold mb-8">Current Residences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentResidences.map((residence) => (
              <motion.div
                key={residence.id}
                variants={fadeInUp}
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-gray-800">
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    [Residence Image]
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{residence.name}</h3>
                  <p className="text-gray-400">{residence.location}</p>
                  <p>{residence.description}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Amenities:</h4>
                    <ul className="list-disc list-inside text-gray-400">
                      {residence.amenities.map((amenity) => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-gray-400">Capacity: {residence.capacity} people</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Target Residences */}
        <motion.section variants={fadeInUp}>
          <h2 className="text-3xl font-bold mb-8">Target Residences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {targetResidences.map((residence) => (
              <motion.div
                key={residence.id}
                variants={fadeInUp}
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-gray-800">
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    [Future Residence Image]
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{residence.name}</h3>
                  <p className="text-gray-400">{residence.location}</p>
                  <p>{residence.description}</p>
                  <div className="flex justify-between text-gray-400">
                    <p>Estimated Cost: {residence.estimatedCost}</p>
                    <p>Target Date: {residence.targetDate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
} 