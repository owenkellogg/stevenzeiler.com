'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { dictionaries } from '@/utils/i18n/dictionaries';

export default function Navigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const dict = dictionaries[language].navigation;

  const links = [
    { href: '/', label: dict.home },
    { href: '/yoga/bikram-26', label: dict.bikram26 },
    { href: '/yoga/bikram-26/practice', label: dict.practice },
  ];

  return (
    <nav className="fixed top-4 left-4 z-50">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-forest-900/80 backdrop-blur-sm rounded-full border border-forest-700 overflow-hidden"
      >
        <ul className="flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2 block transition-colors ${
                  pathname === link.href
                    ? 'bg-leaf-600 text-earth-50'
                    : 'text-earth-200 hover:bg-forest-800 hover:text-earth-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </nav>
  );
} 