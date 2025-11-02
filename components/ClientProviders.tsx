/**
 * ClientProviders - Wrapper for all client-side providers
 */

'use client';

import { ThemeProvider } from '../contexts/ThemeContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
