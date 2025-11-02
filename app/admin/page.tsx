'use client';

/**
 * Page admin principale - Redesigned with Notion/Shadcn aesthetic
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const isLoggedIn = localStorage.getItem('admin_logged_in');

    if (!isLoggedIn || !storedToken) {
      router.push('/admin/login');
      return;
    }

    setToken(storedToken);

    // Fetch groups avec le token
    fetch('/api/admin/groups', {
      headers: {
        'Authorization': `Bearer ${storedToken}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          throw new Error('Non autorisé');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          setGroups([]);
        }
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
        setGroups([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard Admin</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/groups/new')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              + Nouveau groupe
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Mes groupes ({groups.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Chargement...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucun groupe créé. Cliquez sur "Nouveau groupe" pour commencer.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
                  onClick={() => router.push(`/admin/groups/${group.id}`)}
                >
                  <h3 className="font-semibold text-foreground mb-2">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Créé le {new Date(group.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/groups/${group.id}`);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Voir →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
