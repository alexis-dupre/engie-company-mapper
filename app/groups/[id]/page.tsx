'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyMapper } from '../../../components/CompanyMapper';
import { DashboardSkeleton } from '../../../components/LoadingSkeletons';

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
            {/* Error Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Une erreur est survenue</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error || 'Données introuvables'}</p>

            <button
              onClick={() => router.push('/groups')}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux groupes
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
