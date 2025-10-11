/**
 * Layout racine Next.js
 */

import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
