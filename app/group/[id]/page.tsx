/**
 * Page d'un groupe spécifique (conserve le Dashboard existant)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompanyMapper } from '@/components/CompanyMapper';
import { CompanyData } from '@/types/company';
import { GroupMetadata } from '@/types/group';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [data, setData] = useState<CompanyData | null>(null);
  const [metadata, setMetadata] = useState<GroupMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error('Groupe non trouvé');
        return res.json();
      })
      .then(response => {
        if (response.success) {
          setData(response.data.group.data);
          setMetadata(response.data.group.metadata);
        } else {
          throw new Error(response.error);
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !metadata) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-red-900 mb-2">Erreur</h2>
            <p className="text-red-700">{error || 'Groupe non trouvé'}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 border-b border-blue-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-blue-700 hover:text-blue-900 font-medium text-sm"
          >
            ← Retour aux groupes
          </button>

          <div className="flex gap-2">
            {metadata.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <CompanyMapper data={data} />
    </>
  );
}
