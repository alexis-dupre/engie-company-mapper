/**
 * Dashboard admin
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GroupMetadata } from '@/types/group';

export default function AdminDashboardPage() {
  const [groups, setGroups] = useState<GroupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/groups')
      .then(res => res.json())
      .then(data => {
        console.log('[DASHBOARD] API response:', data);
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          console.warn('[DASHBOARD] Invalid groups data, using empty array');
          setGroups([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('[DASHBOARD] Error fetching groups:', err);
        setGroups([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Gérez vos groupes d'entreprises</p>
          </div>

          <Link
            href="/admin/groups/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ➕ Nouveau groupe
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups && Array.isArray(groups) && groups.map(group => (
            <Link
              key={group.id}
              href={`/admin/groups/${group.id}`}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {group.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {group.dilitrustModules.length > 0 && (
                <div className="text-xs text-gray-600">
                  Modules : {group.dilitrustModules.join(', ')}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>{group.isPublic ? '🌐 Public' : '🔒 Privé'}</span>
                <span>{new Date(group.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">Aucun groupe créé</p>
            <Link
              href="/admin/groups/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer votre premier groupe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
