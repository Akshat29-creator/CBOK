import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CBOW — Continuous Bag of Words Interactive Word2Vec Visualizer',
  description:
    'Comprehensive educational NLP simulator for demonstrating the Continuous Bag of Words (CBOW) Word2Vec algorithm, neural architectures, cross-entropy loss, and backpropagation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#070b14] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
