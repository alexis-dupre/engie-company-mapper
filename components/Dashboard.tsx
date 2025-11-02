/**
 * Composant Dashboard - Redesigned with Notion/Shadcn aesthetic
 */

import React from 'react';
import { CompanyStats } from '../types/company';

interface DashboardProps {
  stats: CompanyStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // Sort sectors by count
  const topSectors = Object.entries(stats.companiesBySector)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Sort sizes by count
  const topSizes = Object.entries(stats.companiesBySize)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total d'entreprises"
          value={stats.totalCompanies}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <MetricCard
          title="Profondeur max"
          value={stats.maxDepth}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
        <MetricCard
          title="Avec site web"
          value={stats.companiesWithWebsite}
          subtitle={`${((stats.companiesWithWebsite / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
        />
        <MetricCard
          title="International"
          value={stats.internationalCompanies}
          subtitle={`${((stats.internationalCompanies / stats.totalCompanies) * 100).toFixed(0)}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by depth */}
        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Répartition par niveau
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.companiesByDepth)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([depth, count]) => {
                const percentage = (count / stats.totalCompanies) * 100;

                return (
                  <div key={depth}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="font-medium text-foreground text-sm">
                          Niveau {depth}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{count}</span>
                        <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top sectors */}
        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Principaux secteurs
            </h3>
          </div>
          <div className="space-y-4">
            {topSectors.map(([sector, count]) => {
              const percentage = (count / stats.totalCompanies) * 100;

              return (
                <div key={sector}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                      <span className="font-medium text-foreground text-sm truncate">
                        {sector}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground ml-2 flex-shrink-0">{count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company sizes */}
        <div className="bg-card border border-border p-6 rounded-lg lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Répartition par taille
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSizes.map(([size, count]) => {
              const percentage = (count / stats.totalCompanies) * 100;

              return (
                <div
                  key={size}
                  className="border border-border p-4 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="text-3xl font-semibold text-foreground mb-2">
                    {count}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mb-3">
                    {size}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md text-xs text-primary font-medium">
                    {percentage.toFixed(1)}%
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

// Metric card component
interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon
}) => {
  return (
    <div className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-muted-foreground font-medium mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
    </div>
  );
};
