/**
 * Layout admin avec navigation
 */

import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                🏢 Company Mapper Admin
              </Link>

              <div className="flex gap-4">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/groups/new"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Nouveau groupe
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-gray-700 hover:text-gray-900 text-sm"
              >
                Voir le site →
              </Link>

              <button
                onClick={() => {
                  document.cookie = 'admin_session=; Max-Age=0; path=/';
                  window.location.href = '/admin/login';
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main>{children}</main>
    </div>
  );
}
