'use client';

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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Fetch groups
    fetch('/api/admin/groups')
      .then(res => res.json())
      .then(data => {
        console.log('[ADMIN] Groups data:', data);
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          console.warn('[ADMIN] Invalid groups data, using empty array');
          setGroups([]);
        }
      })
      .catch(err => {
        console.error('[ADMIN] Error fetching groups:', err);
        setGroups([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/groups/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nouveau groupe
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Groupes ({groups.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Aucun groupe créé. Cliquez sur "Nouveau groupe" pour commencer.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups && Array.isArray(groups) && groups.map((group) => (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/group/${group.id}`)}
                >
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    Créé le {new Date(group.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
