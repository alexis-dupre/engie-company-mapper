/**
 * Composant Dashboard - Statistiques et visualisations
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
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total d'entreprises"
          value={stats.totalCompanies}
          icon="🏢"
          color="blue"
        />
        <MetricCard
          title="Profondeur max"
          value={stats.maxDepth}
          icon="📊"
          color="green"
        />
        <MetricCard
          title="Avec site web"
          value={stats.companiesWithWebsite}
          subtitle={`${((stats.companiesWithWebsite / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon="🔗"
          color="purple"
        />
        <MetricCard
          title="International"
          value={stats.internationalCompanies}
          subtitle={`${((stats.internationalCompanies / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon="🌍"
          color="orange"
        />
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par profondeur */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Répartition par niveau hiérarchique
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.companiesByDepth)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([depth, count]) => {
                const percentage = (count / stats.totalCompanies) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                const color = colors[Number(depth)] || 'bg-gray-500';
                
                return (
                  <div key={depth}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        Niveau {depth}
                      </span>
                      <span className="text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        {/* Top secteurs */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Principaux secteurs d'activité
          </h3>
          <div className="space-y-3">
            {topSectors.map(([sector, count], idx) => {
              const percentage = (count / stats.totalCompanies) * 100;
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
                'bg-indigo-500',
                'bg-teal-500',
                'bg-red-500',
              ];
              const color = colors[idx % colors.length];
              
              return (
                <div key={sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate flex-1 pr-2">
                      {sector}
                    </span>
                    <span className="text-gray-600 flex-shrink-0">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Taille des entreprises */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Répartition par taille
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSizes.map(([size, count]) => {
              const percentage = (count / stats.totalCompanies) * 100;
              
              return (
                <div key={size} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {size}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}% du total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant carte de métrique
interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
  };
  
  return (
    <div className={`p-6 rounded-lg border-2 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h4 className="text-sm font-medium opacity-75">{title}</h4>
      {subtitle && (
        <p className="text-xs opacity-60 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
