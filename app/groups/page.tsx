'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CompanyTags, TagType } from '../../types/company';

interface GroupWithStats {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  stats?: {
    totalCompanies: number;
    tagsUsed: string[];
  };
}

interface TagFilter {
  type: TagType;
  label: string;
  color: string;
}

const PREDEFINED_TAG_FILTERS: TagFilter[] = [
  { type: 'TOP20', label: 'TOP 20', color: 'from-yellow-400 to-orange-500' },
  { type: 'TOP50', label: 'TOP 50', color: 'from-green-400 to-emerald-500' },
  { type: 'CLIENT_DILITRUST', label: 'Client DiliTrust', color: 'from-purple-400 to-pink-500' },
];

export default function GroupsListPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithStats[]>([]);
  const [groupTags, setGroupTags] = useState<Record<string, CompanyTags>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<TagType>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'companies'>('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups
        const groupsRes = await fetch('/api/groups');
        const groupsData = await groupsRes.json();

        if (groupsData.success && Array.isArray(groupsData.groups)) {
          const enrichedGroups = await Promise.all(
            groupsData.groups.map(async (group: GroupWithStats) => {
              try {
                // Fetch data for each group to get company count
                const dataRes = await fetch(`/api/groups/${group.id}`);
                const dataJson = await dataRes.json();

                // Fetch tags for each group
                const tagsRes = await fetch(`/api/groups/${group.id}/tags`);
                const tagsJson = await tagsRes.json();

                let totalCompanies = 0;
                if (dataJson.success && dataJson.group?.data?.company) {
                  totalCompanies = countCompanies(dataJson.group.data.company);
                }

                const tagsUsed = new Set<string>();
                if (tagsJson.success && tagsJson.tags) {
                  setGroupTags(prev => ({ ...prev, [group.id]: tagsJson.tags }));
                  Object.values(tagsJson.tags as CompanyTags).forEach((tags: any) => {
                    tags.forEach((tag: any) => {
                      if (tag.type === 'CUSTOM' && tag.customName) {
                        tagsUsed.add(`CUSTOM:${tag.customName}`);
                      } else {
                        tagsUsed.add(tag.type);
                      }
                    });
                  });
                }

                return {
                  ...group,
                  stats: {
                    totalCompanies,
                    tagsUsed: Array.from(tagsUsed),
                  },
                };
              } catch (err) {
                console.error(`Error fetching data for group ${group.id}:`, err);
                return group;
              }
            })
          );

          setGroups(enrichedGroups);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to count companies recursively
  const countCompanies = (company: any): number => {
    if (!company) return 0;
    let count = 1;
    if (company.subsidiaries && Array.isArray(company.subsidiaries)) {
      company.subsidiaries.forEach((sub: any) => {
        count += countCompanies(sub);
      });
    }
    return count;
  };

  // Check if a group has a specific tag
  const groupHasTag = (groupId: string, tagType: TagType): boolean => {
    const tags = groupTags[groupId];
    if (!tags) return false;

    return Object.values(tags).some((companyTags: any) =>
      companyTags.some((tag: any) => tag.type === tagType)
    );
  };

  // Toggle tag filter
  const toggleTagFilter = (tagType: TagType) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagType)) {
        newSet.delete(tagType);
      } else {
        newSet.add(tagType);
      }
      return newSet;
    });
  };

  // Filtered and sorted groups
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.size > 0) {
      result = result.filter(group =>
        Array.from(selectedTags).every(tagType => groupHasTag(group.id, tagType))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'companies':
          return (b.stats?.totalCompanies || 0) - (a.stats?.totalCompanies || 0);
        case 'recent':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [groups, searchTerm, selectedTags, sortBy, groupTags]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header moderne */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="text-sm mb-3">
            <Link href="/" className="text-pink-600 hover:text-pink-700 font-medium transition-colors">
              Accueil
            </Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Groupes</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Tous les groupes</h1>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Chargement...' : `${filteredGroups.length} groupe${filteredGroups.length > 1 ? 's' : ''} ${filteredGroups.length !== groups.length ? `sur ${groups.length}` : ''}`}
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un groupe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
            </div>

            {(selectedTags.size > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedTags(new Set());
                  setSearchTerm('');
                }}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tag filters */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filtrer par tags
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAG_FILTERS.map((filter) => {
                  const isSelected = selectedTags.has(filter.type);
                  return (
                    <button
                      key={filter.type}
                      onClick={() => toggleTagFilter(filter.type)}
                      className={`
                        px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200
                        ${isSelected
                          ? `bg-gradient-to-r ${filter.color} text-white shadow-lg scale-105`
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      {filter.label}
                      {isSelected && (
                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Trier par
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'recent' as const, label: 'Plus récent', icon: '🕐' },
                  { value: 'name' as const, label: 'Nom', icon: '🔤' },
                  { value: 'companies' as const, label: 'Nb entreprises', icon: '📊' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`
                      flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                      ${sortBy === option.value
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement des groupes...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {groups.length === 0 ? 'Aucun groupe disponible' : 'Aucun groupe trouvé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {groups.length === 0
                ? 'Créez votre premier groupe depuis l\'interface d\'administration'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {groups.length === 0 && (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 font-semibold transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Se connecter en admin
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden"
              >
                {/* Decorative gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(group.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>

                  {/* Stats */}
                  {group.stats && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {group.stats.totalCompanies} entreprise{group.stats.totalCompanies > 1 ? 's' : ''}
                        </span>
                      </div>

                      {group.stats.tagsUsed.length > 0 && (
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1">
                              {group.stats.tagsUsed.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  {tag.startsWith('CUSTOM:') ? tag.replace('CUSTOM:', '') : tag}
                                </span>
                              ))}
                              {group.stats.tagsUsed.length > 3 && (
                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                                  +{group.stats.tagsUsed.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-pink-600 font-semibold text-sm group-hover:text-pink-700">
                      Voir le mapping
                    </span>
                    <svg className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
