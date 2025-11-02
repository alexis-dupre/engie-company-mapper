/**
 * Page admin de visualisation d'un groupe avec gestion des tags
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyMapper } from '../../../../components/CompanyMapper';

export default function AdminGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('admin_token');
    const isLoggedIn = localStorage.getItem('admin_logged_in');

    if (!isLoggedIn || !token) {
      router.push('/admin/login');
      return;
    }

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
  }, [params.id, router]);

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-red-900 mb-2">Erreur</h2>
            <p className="text-red-700">{error || 'Groupe non trouvé'}</p>
            <button
              onClick={() => router.push('/admin')}
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
    <div className="min-h-screen bg-gray-50">
      {/* Fil d'ariane admin */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Accueil
            </Link>
            {' › '}
            <Link href="/admin" className="hover:text-blue-600">
              Administration
            </Link>
            {' › '}
            <span className="text-gray-900 font-medium">{groupName}</span>
          </nav>
        </div>
      </div>

      {/* Lien vers la vue publique */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          href={`/groups/${params.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          👁️ Voir en mode public
        </Link>
      </div>

      {/* CompanyMapper en mode admin */}
      <CompanyMapper data={data} />
    </div>
  );
}
