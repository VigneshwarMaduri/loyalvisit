import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoyalVisit - Turn Walk-ins into Regulars',
  description: 'LoyalVisit - B2B Digital Loyalty & Retention Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-neutral-900 sm:bg-neutral-900">
      <body className="h-full antialiased font-sans flex items-center justify-center p-0 m-0">
        <div className="max-w-md mx-auto h-[100dvh] bg-gray-50 overflow-hidden relative shadow-2xl sm:border sm:border-gray-200 flex flex-col w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
