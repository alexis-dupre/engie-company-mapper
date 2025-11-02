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
}

const PREDEFINED_TAG_FILTERS: TagFilter[] = [
  { type: 'TOP20', label: 'TOP 20' },
  { type: 'TOP50', label: 'TOP 50' },
  { type: 'CLIENT_DILITRUST', label: 'Client DiliTrust' },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="text-sm mb-3 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <span className="mx-2">›</span>
            <span className="text-foreground font-medium">Groupes</span>
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Tous les groupes</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Chargement...' : `${filteredGroups.length} groupe${filteredGroups.length > 1 ? 's' : ''} ${filteredGroups.length !== groups.length ? `sur ${groups.length}` : ''}`}
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Filtres</h2>

            {(selectedTags.size > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedTags(new Set());
                  setSearchTerm('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tag filters */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAG_FILTERS.map((filter) => {
                  const isSelected = selectedTags.has(filter.type);
                  return (
                    <button
                      key={filter.type}
                      onClick={() => toggleTagFilter(filter.type)}
                      className={`
                        px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                        ${isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                        }
                      `}
                    >
                      {filter.label}
                      {isSelected && (
                        <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Trier par
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'recent' as const, label: 'Récent' },
                  { value: 'name' as const, label: 'Nom' },
                  { value: 'companies' as const, label: 'Entreprises' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`
                      flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                      }
                    `}
                  >
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Chargement des groupes...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {groups.length === 0 ? 'Aucun groupe disponible' : 'Aucun groupe trouvé'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {groups.length === 0
                ? 'Créez votre premier groupe depuis l\'interface d\'administration'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {groups.length === 0 && (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Se connecter en admin
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="group bg-card border border-border rounded-lg p-5 hover:border-foreground/20 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-foreground mb-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                {/* Stats */}
                {group.stats && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {group.stats.totalCompanies} entreprise{group.stats.totalCompanies > 1 ? 's' : ''}
                      </span>
                    </div>

                    {group.stats.tagsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {group.stats.tagsUsed.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                            {tag.startsWith('CUSTOM:') ? tag.replace('CUSTOM:', '') : tag}
                          </span>
                        ))}
                        {group.stats.tagsUsed.length > 3 && (
                          <span className="inline-block px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded">
                            +{group.stats.tagsUsed.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Voir le mapping
                  </span>
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
