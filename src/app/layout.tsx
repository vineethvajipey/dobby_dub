import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from '@/lib/settings-context';
import SettingsPanel from '@/components/SettingsPanel';
import { Analytics } from '@vercel/analytics/react';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Dobby Dub",
  description: "A voice dubbing assistant powered by Eleven Labs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={roboto.className}>
        <SettingsProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            {children}
          </div>
          <SettingsPanel />
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
