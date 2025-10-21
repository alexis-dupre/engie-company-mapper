'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  createdAt: number;
}

export default function GroupsListPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch tous les groupes (route publique)
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        }
      })
      .catch(err => console.error('Error fetching groups:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec breadcrumb */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm mb-2">
            <Link href="/" className="text-blue-600 hover:underline">Accueil</Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900">Groupes</span>
          </nav>
          <h1 className="text-2xl font-bold">Tous les groupes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">Aucun groupe disponible</p>
            <Link
              href="/admin/login"
              className="text-blue-600 hover:underline"
            >
              Connectez-vous en tant qu'admin pour créer des groupes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="bg-white border-2 rounded-lg p-6 hover:shadow-lg cursor-pointer transition-all hover:border-blue-500"
              >
                <h3 className="font-bold text-xl mb-2">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Créé le {new Date(group.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="text-blue-600 text-sm font-medium">
                  Voir le mapping →
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
