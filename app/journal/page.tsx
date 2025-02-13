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

// Sample journal entries - in a real app, these would come from your database
const journalEntries = [
  {
    id: 1,
    date: '2024-05-23',
    title: 'Morning Meditation Insights',
    content: 'Today\'s meditation session brought profound insights about the nature of consciousness...',
    tags: ['meditation', 'consciousness', 'insights']
  },
  {
    id: 2,
    date: '2024-05-22',
    title: 'New Yoga Sequence Development',
    content: 'Working on a new sequence for senior practitioners that focuses on gentle movements...',
    tags: ['yoga', 'teaching', 'seniors']
  },
  {
    id: 3,
    date: '2024-05-21',
    title: 'Retreat Planning Notes',
    content: 'Met with the team to discuss the upcoming summer retreat. Key points to consider...',
    tags: ['retreat', 'planning', 'organization']
  }
];

export default function JournalPage() {
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
        className="max-w-4xl mx-auto space-y-8"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Personal Journal</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            New Entry
          </button>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-6">
          {journalEntries.map((entry) => (
            <motion.article
              key={entry.id}
              variants={fadeInUp}
              className="bg-gray-900 rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{entry.title}</h2>
                  <p className="text-gray-400">{entry.date}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
              
              <p className="text-gray-300">{entry.content}</p>
              
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
} 