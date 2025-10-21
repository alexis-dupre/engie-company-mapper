'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompanyMapper } from '../../../components/CompanyMapper';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const groupId = params.id as string;

    if (!groupId) {
      setError('ID de groupe manquant');
      setIsLoading(false);
      return;
    }

    // Fetch le groupe depuis l'API
    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Groupe non trouvé');
        }
        return res.json();
      })
      .then(responseData => {
        console.log('Group data received:', responseData);

        if (responseData.success && responseData.group) {
          // Le groupe contient les données dans group.data
          setData(responseData.group.data);
        } else {
          throw new Error('Format de données invalide');
        }

        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading group:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-red-900 mb-2">Erreur</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">📄</span>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">Aucune donnée</h2>
            <p className="text-yellow-700 mb-4">Aucune donnée n'a pu être chargée.</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <CompanyMapper data={data} />;
}
