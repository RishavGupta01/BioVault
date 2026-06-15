import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PWARegister from '@/components/PWARegister';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BioVault — Clinical Interaction Engine',
  description:
    'Premium local-first health interaction engine. Track medications, supplements, and food interactions with clinical-grade accuracy.',
  keywords: [
    'health',
    'medication',
    'supplement',
    'interaction',
    'clinical',
    'wellness',
  ],
  authors: [{ name: 'BioVault' }],
  openGraph: {
    title: 'BioVault — Clinical Interaction Engine',
    description:
      'Track medications, supplements, and food interactions with clinical-grade accuracy.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
