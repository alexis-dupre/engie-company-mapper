/**
 * Layout racine Next.js
 */

import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '../components/ClientProviders';

export const metadata: Metadata = {
  title: 'Engie Company Mapper - Visualisation organisationnelle',
  description: 'Application professionnelle de visualisation et d\'analyse de la structure organisationnelle d\'Engie et de ses filiales',
  keywords: 'Engie, mapping, organisation, entreprise, filiales, visualisation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
