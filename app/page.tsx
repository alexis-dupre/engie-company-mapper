'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Company Mapper</h1>
        <p className="text-gray-600 mb-6">
          Application de visualisation et d'analyse de structures organisationnelles
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Espace Admin
          </button>

          <button
            onClick={() => router.push('/admin')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Voir les groupes
          </button>
        </div>
      </div>
    </div>
  );
}
