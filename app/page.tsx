'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <span className="text-sm font-medium text-muted-foreground">Julian Machado</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="py-24 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
            Visualisez le Territory Plan<br />de Julian Machado
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Vous trouverez ici mon territory plans intégrant les sociétés P1/P2 et P3 des secteurs qui m'ont été attribués
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/groups')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span>Explorer les groupes</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/admin/login')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Espace Admin</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
