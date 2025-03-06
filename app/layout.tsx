import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/utils/i18n/LanguageProvider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AdminDrawer from '@/components/AdminDrawer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navigation from '@/components/Navigation';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Steven Zeiler - Meditation & Yoga",
  description: "Zen meditation, yoga, and spiritual guidance by Steven Zeiler",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Steven Zeiler - Yoga & Meditation",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.email === 'me@stevenzeiler.com';

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <meta name="theme-color" content="#065f46" />
      </head>
      <body className={`${GeistSans.className} bg-gray-950 text-gray-100`}>
        <ThemeProvider>
          <LanguageProvider>
            <main className="min-h-screen">
              {isAdmin && <AdminDrawer />}
              <Navigation />
              <LanguageSwitcher />
              <div className="flex-1">{children}</div>
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
