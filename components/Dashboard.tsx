/**
 * Composant Dashboard - Statistiques et visualisations
 * Redesigned with modern animations and Airbnb-inspired aesthetic
 */

import React from 'react';
import { CompanyStats } from '../types/company';

interface DashboardProps {
  stats: CompanyStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // Trier les secteurs par nombre
  const topSectors = Object.entries(stats.companiesBySector)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Trier les tailles par nombre
  const topSizes = Object.entries(stats.companiesBySize)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Métriques principales - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total d'entreprises"
          value={stats.totalCompanies}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          gradient="from-pink-500 to-rose-500"
          delay={0}
        />
        <MetricCard
          title="Profondeur max"
          value={stats.maxDepth}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
          gradient="from-purple-500 to-indigo-500"
          delay={100}
        />
        <MetricCard
          title="Avec site web"
          value={stats.companiesWithWebsite}
          subtitle={`${((stats.companiesWithWebsite / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
          gradient="from-blue-500 to-cyan-500"
          delay={200}
        />
        <MetricCard
          title="International"
          value={stats.internationalCompanies}
          subtitle={`${((stats.internationalCompanies / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          gradient="from-green-500 to-emerald-500"
          delay={300}
        />
      </div>

      {/* Graphiques - Redesigned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par profondeur */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Répartition par niveau
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.companiesByDepth)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([depth, count], index) => {
                const percentage = (count / stats.totalCompanies) * 100;
                const gradients = [
                  'from-pink-400 to-rose-500',
                  'from-purple-400 to-indigo-500',
                  'from-blue-400 to-cyan-500'
                ];
                const gradient = gradients[Number(depth)] || 'from-gray-400 to-gray-500';

                return (
                  <div key={depth} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`}></span>
                        <span className="font-semibold text-gray-800">
                          Niveau {depth}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out animate-slide-in`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${500 + index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top secteurs */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Principaux secteurs
            </h3>
          </div>
          <div className="space-y-4">
            {topSectors.map(([sector, count], idx) => {
              const percentage = (count / stats.totalCompanies) * 100;
              const gradients = [
                'from-pink-400 to-rose-500',
                'from-purple-400 to-indigo-500',
                'from-blue-400 to-cyan-500',
                'from-green-400 to-emerald-500',
                'from-yellow-400 to-orange-500',
                'from-red-400 to-pink-500',
                'from-indigo-400 to-purple-500',
                'from-cyan-400 to-blue-500',
              ];
              const gradient = gradients[idx % gradients.length];

              return (
                <div key={sector} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`}></span>
                      <span className="font-medium text-gray-800 truncate">
                        {sector}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 ml-2 flex-shrink-0">{count}</span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out animate-slide-in`}
                      style={{
                        width: `${percentage}%`,
                        animationDelay: `${600 + idx * 80}ms`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Taille des entreprises */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Répartition par taille
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSizes.map(([size, count], idx) => {
              const percentage = (count / stats.totalCompanies) * 100;
              const gradients = [
                'from-pink-500 to-rose-500',
                'from-purple-500 to-indigo-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-yellow-500 to-orange-500',
                'from-red-500 to-pink-500',
              ];
              const gradient = gradients[idx % gradients.length];

              return (
                <div
                  key={size}
                  className={`group relative bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden animate-scale-in`}
                  style={{ animationDelay: `${700 + idx * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2">
                      {count}
                    </div>
                    <div className="text-sm text-white/90 font-medium mb-3">
                      {size}
                    </div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 1s ease-out forwards;
          width: 0;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

// Composant carte de métrique modernisé
interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  delay
}) => {
  return (
    <div
      className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
              {value}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500 font-medium mt-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      </div>

      {/* Decorative corner */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform group-hover:scale-150 transition-transform duration-500`}></div>
    </div>
  );
};
