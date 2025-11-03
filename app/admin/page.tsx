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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const loadGroups = () => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) return;

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
  };

  const handleDeleteGroup = async (groupId: string, groupName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    setDeletingId(groupId);

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Recharger la liste des groupes
        loadGroups();
      } else {
        alert('Erreur lors de la suppression : ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Erreur lors de la suppression du groupe');
    } finally {
      setDeletingId(null);
    }
  };

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
                  className="border border-border rounded-lg p-6 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all relative"
                  onClick={() => router.push(`/admin/groups/${group.id}`)}
                >
                  {/* Bouton de suppression */}
                  <button
                    onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                    disabled={deletingId === group.id}
                    className="absolute top-3 right-3 p-2 bg-card border border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    title="Supprimer ce groupe"
                  >
                    {deletingId === group.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>

                  <h3 className="font-semibold text-foreground mb-2 pr-8">{group.name}</h3>
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
