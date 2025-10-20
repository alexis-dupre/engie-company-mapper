/**
 * Page d'édition d'un groupe (version simplifiée)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Group } from '@/types/group';

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/groups/${groupId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroup(data.data.group);
        } else {
          setError(data.error);
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [groupId]);

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

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-red-900 mb-2">Erreur</h2>
            <p className="text-red-700">{error || 'Groupe non trouvé'}</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Retour au dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {group.metadata.name}
          </h1>
          <p className="text-gray-600">
            Édition du groupe (fonctionnalité complète à venir)
          </p>
        </div>

        {/* Informations du groupe */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Nom :</span>
              <p className="text-gray-900">{group.metadata.name}</p>
            </div>

            {group.metadata.description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Description :</span>
                <p className="text-gray-900">{group.metadata.description}</p>
              </div>
            )}

            <div>
              <span className="text-sm font-medium text-gray-700">Tags :</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {group.metadata.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {group.metadata.dilitrustModules.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Modules DiliTrust :</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {group.metadata.dilitrustModules.map(module => (
                    <span key={module} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-sm font-medium text-gray-700">Visibilité :</span>
              <p className="text-gray-900">{group.metadata.isPublic ? '🌐 Public' : '🔒 Privé'}</p>
            </div>

            {group.metadata.comments && (
              <div>
                <span className="text-sm font-medium text-gray-700">Commentaires :</span>
                <p className="text-gray-900 whitespace-pre-wrap">{group.metadata.comments}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lien vers la vue publique */}
        <div className="mt-6">
          <Link
            href={`/group/${groupId}`}
            target="_blank"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            👁️ Voir en mode public
          </Link>
        </div>
      </div>
    </div>
  );
}
