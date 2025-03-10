'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const drawerVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const links = [
    { href: '/', label: 'Home', icon: '��' },
    { href: '/people', label: 'People', icon: '👥' },
    { href: '/organizations', label: 'Organizations', icon: '🏢' },
    { href: '/residences', label: 'Residences', icon: '🏛️' },
    { href: '/journal', label: 'Journal', icon: '📔' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-forest-900/80 backdrop-blur-sm rounded-full hover:bg-forest-800 transition-colors border border-forest-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-earth-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-forest-950/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-forest-900/95 backdrop-blur-sm text-earth-50 z-50 p-4 border-r border-forest-700"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-earth-100">Admin Panel</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-forest-800 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1">
                  <nav className="space-y-2">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 p-2 rounded transition-colors ${
                          pathname === link.href
                            ? 'bg-leaf-600 text-earth-50'
                            : 'hover:bg-forest-800 text-earth-200'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="pt-4 border-t border-forest-800">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full p-2 text-earth-400 hover:bg-forest-800 hover:text-earth-200 rounded transition-colors"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 