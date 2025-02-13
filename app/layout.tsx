import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/utils/i18n/LanguageProvider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AdminDrawer from '@/components/AdminDrawer';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Steven Zeiler - Meditation & Yoga",
  description: "Zen meditation, yoga, and spiritual guidance by Steven Zeiler",
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
      <body className={`${GeistSans.className} bg-gray-950 text-gray-100`}>
        <ThemeProvider>
          <LanguageProvider>
            <main className="min-h-screen">
              {isAdmin && <AdminDrawer />}
              <LanguageSwitcher />
              <div className="flex-1">{children}</div>
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
