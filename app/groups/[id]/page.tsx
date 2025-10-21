'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyMapper } from '../../../components/CompanyMapper';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const groupId = params.id as string;

    if (!groupId) {
      setError('ID de groupe manquant');
      setIsLoading(false);
      return;
    }

    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error('Groupe non trouvé');
        return res.json();
      })
      .then(responseData => {
        if (responseData.success && responseData.group) {
          setData(responseData.group.data);
          setGroupName(responseData.group.name);
        } else {
          throw new Error('Format de données invalide');
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.id]);

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-red-900 mb-2">Erreur</h2>
            <p className="text-red-700 mb-4">{error || 'Données introuvables'}</p>
            <button
              onClick={() => router.push('/groups')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour aux groupes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb fixe en haut */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Accueil</Link>
            <span className="mx-2 text-gray-400">›</span>
            <Link href="/groups" className="text-blue-600 hover:underline">Groupes</Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{groupName}</span>
          </nav>
        </div>
      </div>

      <CompanyMapper data={data} />
    </div>
  );
}
