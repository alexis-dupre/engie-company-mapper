/**
 * Page d'accueil publique - Liste des groupes
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GroupMetadata } from '@/types/group';

export default function HomePage() {
  const [groups, setGroups] = useState<GroupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups(data.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Company Mapper
              </h1>
              <p className="text-gray-600 mt-1">
                Explorez les structures organisationnelles des grands groupes
              </p>
            </div>

            <Link
              href="/admin/login"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Administration
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Groupes disponibles ({groups.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/group/${group.id}`}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {group.dilitrustModules.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-1">Modules DiliTrust :</p>
                  <div className="flex flex-wrap gap-1">
                    {group.dilitrustModules.map(module => (
                      <span
                        key={module}
                        className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                Cliquez pour explorer →
              </div>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">Aucun groupe disponible pour le moment</p>
          </div>
        )}
      </main>
    </div>
  );
}
