import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unicode Calculator',
  description: 'A calculator that understands numerals from any Unicode script.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-4">{children}</body>
    </html>
  );
}
