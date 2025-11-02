/**
 * Page admin de visualisation d'un groupe avec gestion des tags
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyMapper } from '../../../../components/CompanyMapper';
import { DashboardSkeleton } from '../../../../components/LoadingSkeletons';

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                  </div>
                </div>
              </div>
              <div className="w-40 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Admin badge skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-40 h-10 bg-white/80 rounded-xl animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="w-32 h-10 bg-white/80 rounded-xl animate-pulse"></div>
            <div className="w-40 h-10 bg-white/80 rounded-xl animate-pulse"></div>
            <div className="w-28 h-10 bg-white/80 rounded-xl animate-pulse"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded-xl"></div>
              <div className="h-10 bg-gray-200 rounded-xl"></div>
              <div className="h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          {/* Dashboard Skeleton */}
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
          <div className="text-center">
            {/* Error Icon with admin badge */}
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Une erreur est survenue</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error || 'Groupe non trouvé'}</p>

            <button
              onClick={() => router.push('/admin')}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au dashboard
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
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
