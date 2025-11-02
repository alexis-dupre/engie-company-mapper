'use client';

/**
 * Composant principal - Application de mapping d'entreprises
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Company, CompanyData, FilterOptions } from '../types/company';
import { CompanyCard } from './CompanyCard';
import { CompanyTree } from './CompanyTree';
import { Dashboard } from './Dashboard';
import { Filters } from './Filters';
import { TagManager } from './TagManager';
import { CommentManager } from './CommentManager';
import type { CompanyTags, CustomTag, TagType, CompanyComments, Comment } from '../types/company';
import {
  calculateStats,
  filterCompanies,
  flattenCompanies,
  getUniqueSectors,
  getUniqueSizes,
  findCompanyById,
  getCompanyPath,
  exportToCSV,
} from '../utils/companyUtils';

interface CompanyMapperProps {
  data: CompanyData;
}

type ViewMode = 'dashboard' | 'tree' | 'list' | 'detail';

export const CompanyMapper: React.FC<CompanyMapperProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sector: null,
    depth: null,
    size: null,
    hasWebsite: null,
  });
  const [tags, setTags] = useState<CompanyTags>({});
  const [comments, setComments] = useState<CompanyComments>({});
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isCommentManagerOpen, setIsCommentManagerOpen] = useState(false);
  const [selectedCompanyForTag, setSelectedCompanyForTag] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedCompanyForComment, setSelectedCompanyForComment] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  
  // Données calculées
  const stats = useMemo(() => calculateStats(data.company), [data.company]);
  const sectors = useMemo(() => getUniqueSectors(data.company), [data.company]);
  const sizes = useMemo(() => getUniqueSizes(data.company), [data.company]);
  
  // Filtrage des données
  const filteredCompany = useMemo(() => {
    return filterCompanies(data.company, filters);
  }, [data.company, filters]);
  
  const allCompanies = useMemo(() => {
    return flattenCompanies(filteredCompany);
  }, [filteredCompany]);
  
  // Entreprise sélectionnée
  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null;
    return findCompanyById(data.company, selectedCompanyId);
  }, [selectedCompanyId, data.company]);
  
  // Breadcrumb de l'entreprise sélectionnée
  const selectedPath = useMemo(() => {
    if (!selectedCompanyId) return [];
    return getCompanyPath(data.company, selectedCompanyId);
  }, [selectedCompanyId, data.company]);

  // Vérifier si on est en mode admin et charger les tags
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    const pathParts = window.location.pathname.split('/');

    console.log('[CompanyMapper] Path:', window.location.pathname);
    console.log('[CompanyMapper] Checking admin mode - Token:', !!token, 'LoggedIn:', !!isLoggedIn);

    // IMPORTANT: Les tags ne peuvent être gérés QUE depuis l'espace admin (/admin/*)
    // Sur les routes publiques (/groups/*), on est TOUJOURS en mode visiteur
    const isPublicRoute = pathParts[1] === 'groups';

    if (isPublicRoute) {
      console.log('[CompanyMapper] Public route detected (/groups/*) - FORCING visitor mode');
      setIsAdminMode(false);

      // Récupérer le groupId pour afficher les tags et commentaires en lecture seule
      if (pathParts[2]) {
        const id = pathParts[2];
        setGroupId(id);

        // Charger les tags et commentaires (accessibles en lecture seule)
        fetch(`/api/groups/${id}/company-comments`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setComments(data.comments || {});
            }
          })
          .catch(err => console.error('[CompanyMapper] Error loading comments:', err));
      }
      return;
    }

    // Sur les routes admin uniquement, vérifier le token et activer le mode admin
    if (pathParts[1] === 'admin' && pathParts[2] === 'groups' && pathParts[3]) {
      const id = pathParts[3];
      setGroupId(id);

      // Vérifier le mode admin en validant le token côté serveur
      if (token && isLoggedIn) {
        console.log('[CompanyMapper] Admin route - validating token for group:', id);
        fetch(`/api/admin/groups/${id}/tags`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            console.log('[CompanyMapper] Server response status:', res.status);
            if (res.status === 401) {
              // Token invalide - nettoyer et désactiver le mode admin
              console.log('[CompanyMapper] Token invalid (401) - cleaning up and disabling admin mode');
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_logged_in');
              setIsAdminMode(false);
              throw new Error('Non autorisé');
            }
            if (!res.ok) {
              throw new Error('Erreur lors du chargement des tags');
            }
            return res.json();
          })
          .then(data => {
            if (data.success) {
              // Token valide - activer le mode admin et charger les tags
              console.log('[CompanyMapper] Token valid - enabling admin mode. Tags loaded:', data.tags);
              setIsAdminMode(true);
              setTags(data.tags || {});

              // Charger également les commentaires (accessibles à tous)
              fetch(`/api/groups/${id}/company-comments`)
                .then(res => res.json())
                .then(commentsData => {
                  if (commentsData.success) {
                    setComments(commentsData.comments || {});
                  }
                })
                .catch(err => console.error('[CompanyMapper] Error loading comments:', err));
            } else {
              console.log('[CompanyMapper] Response not successful - disabling admin mode');
              setIsAdminMode(false);
            }
          })
          .catch(err => {
            console.error('[CompanyMapper] Error validating token:', err);
            setIsAdminMode(false);
          });
      } else {
        // Pas de token - mode visiteur
        console.log('[CompanyMapper] No token found - visitor mode');
        setIsAdminMode(false);
      }
    } else {
      // Autre route - mode visiteur par défaut
      console.log('[CompanyMapper] Other route - visitor mode');
      setIsAdminMode(false);
    }
  }, []);

  // Gestion de la sélection d'entreprise
  const handleCompanySelect = (company: Company) => {
    setSelectedCompanyId(company.accountId);
    setViewMode('detail');
  };
  
  // Export CSV
  const handleExportCSV = () => {
    const csv = exportToCSV(filteredCompany);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `engie-mapping-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenTagManager = (company: Company) => {
    setSelectedCompanyForTag({
      id: company.accountId,
      name: company.name,
    });
    setIsTagManagerOpen(true);
  };

  const handleSaveTag = async (tag: CustomTag) => {
    if (!selectedCompanyForTag || !groupId) return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/groups/${groupId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: selectedCompanyForTag.id,
          tag
        })
      });

      if (response.ok) {
        // Recharger les tags
        const tagsRes = await fetch(`/api/admin/groups/${groupId}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tagsData = await tagsRes.json();
        if (tagsData.success) {
          setTags(tagsData.tags || {});
        }
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Erreur lors de l\'ajout du tag');
    }
  };

  const handleDeleteTag = async (tagType: TagType) => {
    if (!selectedCompanyForTag || !groupId) return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/groups/${groupId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: selectedCompanyForTag.id,
          tagType
        })
      });

      if (response.ok) {
        // Recharger les tags
        const tagsRes = await fetch(`/api/admin/groups/${groupId}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tagsData = await tagsRes.json();
        if (tagsData.success) {
          setTags(tagsData.tags || {});
        }
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Erreur lors de la suppression du tag');
    }
  };

  const handleOpenCommentManager = (company: Company) => {
    setSelectedCompanyForComment({
      id: company.accountId,
      name: company.name,
    });
    setIsCommentManagerOpen(true);
  };

  const handleSaveComment = async (text: string, author?: string) => {
    if (!selectedCompanyForComment || !groupId) return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/company-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: selectedCompanyForComment.id,
          text,
          author
        })
      });

      if (response.ok) {
        // Recharger les commentaires
        const commentsRes = await fetch(`/api/groups/${groupId}/company-comments`);
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.comments || {});
        }
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedCompanyForComment || !groupId) return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/company-comments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: selectedCompanyForComment.id,
          commentId
        })
      });

      if (response.ok) {
        // Recharger les commentaires
        const commentsRes = await fetch(`/api/groups/${groupId}/company-comments`);
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.comments || {});
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* En-tête moderne avec glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {data.company.name}
                  </h1>
                  <p className="text-sm text-gray-500">Mapping organisationnel</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-semibold text-gray-900">{allCompanies.length}</span>
                  <span className="text-gray-600">entreprise{allCompanies.length > 1 ? 's' : ''}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{new Date(data.metadata.endTime).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation par onglets */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton
            active={viewMode === 'dashboard'}
            onClick={() => setViewMode('dashboard')}
            icon="📊"
            label="Dashboard"
          />
          <TabButton
            active={viewMode === 'tree'}
            onClick={() => setViewMode('tree')}
            icon="🌳"
            label="Vue hiérarchique"
          />
          <TabButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            icon="📋"
            label="Liste"
          />
          {selectedCompany && (
            <TabButton
              active={viewMode === 'detail'}
              onClick={() => setViewMode('detail')}
              icon="🔍"
              label={`Détail: ${selectedCompany.name}`}
            />
          )}
        </div>
        
        {/* Filtres (toujours visibles) */}
        <div className="mb-6">
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            sectors={sectors}
            sizes={sizes}
            maxDepth={stats.maxDepth}
          />
        </div>
        
        {/* Contenu selon le mode de vue */}
        <div className="space-y-6">
          {viewMode === 'dashboard' && (
            <Dashboard stats={stats} />
          )}
          
          {viewMode === 'tree' && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Arbre hiérarchique
                </h2>
              </div>
              <CompanyTree
                company={filteredCompany}
                onCompanySelect={handleCompanySelect}
                selectedId={selectedCompanyId || undefined}
                customTags={tags}
                isAdminMode={isAdminMode}
                onManageTags={isAdminMode ? handleOpenTagManager : undefined}
              />
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Liste des entreprises
                  <span className="ml-2 text-lg font-normal text-gray-500">({allCompanies.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allCompanies.map(company => (
                  <CompanyCard
                    key={company.accountId}
                    company={company}
                    onSelect={handleCompanySelect}
                    isSelected={company.accountId === selectedCompanyId}
                    customTags={tags[company.accountId] || []}
                    comments={comments[company.accountId] || []}
                    isAdminMode={isAdminMode}
                    onManageTags={isAdminMode ? () => handleOpenTagManager(company) : undefined}
                    onManageComments={isAdminMode ? () => handleOpenCommentManager(company) : undefined}
                  />
                ))}
              </div>
              
              {allCompanies.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">Aucune entreprise ne correspond aux critères</p>
                  <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres</p>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'detail' && selectedCompany && (
            <div className="space-y-6">
              {/* Breadcrumb */}
              {selectedPath.length > 1 && (
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-gray-200/50 shadow-md">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    {selectedPath.map((company, idx) => (
                      <React.Fragment key={company.accountId}>
                        <button
                          onClick={() => handleCompanySelect(company)}
                          className="font-medium text-gray-700 hover:text-pink-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-pink-50"
                        >
                          {company.name}
                        </button>
                        {idx < selectedPath.length - 1 && (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Détails de l'entreprise */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl">
                <CompanyCard
                  company={selectedCompany}
                  showSubsidiaries={false}
                  customTags={tags[selectedCompany.accountId] || []}
                  comments={comments[selectedCompany.accountId] || []}
                  isAdminMode={isAdminMode}
                  onManageTags={isAdminMode ? () => handleOpenTagManager(selectedCompany) : undefined}
                  onManageComments={isAdminMode ? () => handleOpenCommentManager(selectedCompany) : undefined}
                />
                
                {/* Tags complets */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="font-bold text-lg text-gray-900">
                      Tous les tags <span className="text-gray-500 font-normal">({selectedCompany.allTags.length})</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.allTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm rounded-lg font-medium hover:from-gray-100 hover:to-gray-200 transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filiales directes */}
              {selectedCompany.subsidiaries.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Filiales directes
                      <span className="ml-2 text-lg font-normal text-gray-500">({selectedCompany.subsidiaries.length})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedCompany.subsidiaries.map(sub => (
                      <CompanyCard
                        key={sub.accountId}
                        company={sub}
                        onSelect={handleCompanySelect}
                        customTags={tags[sub.accountId] || []}
                        comments={comments[sub.accountId] || []}
                        isAdminMode={isAdminMode}
                        onManageTags={isAdminMode ? () => handleOpenTagManager(sub) : undefined}
                        onManageComments={isAdminMode ? () => handleOpenCommentManager(sub) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tag Manager Modal */}
      {isTagManagerOpen && selectedCompanyForTag && (
        <TagManager
          companyId={selectedCompanyForTag.id}
          companyName={selectedCompanyForTag.name}
          currentTags={tags[selectedCompanyForTag.id] || []}
          onClose={() => {
            setIsTagManagerOpen(false);
            setSelectedCompanyForTag(null);
          }}
          onSave={handleSaveTag}
          onDelete={handleDeleteTag}
        />
      )}

      {/* Comment Manager Modal */}
      {isCommentManagerOpen && selectedCompanyForComment && (
        <CommentManager
          companyId={selectedCompanyForComment.id}
          companyName={selectedCompanyForComment.name}
          currentComments={comments[selectedCompanyForComment.id] || []}
          onClose={() => {
            setIsCommentManagerOpen(false);
            setSelectedCompanyForComment(null);
          }}
          onSave={handleSaveComment}
          onDelete={handleDeleteComment}
        />
      )}
    </div>
  );
};

// Bouton d'onglet moderne
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap
        flex items-center gap-2 overflow-hidden
        ${active
          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 scale-105'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {active && (
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      )}
      <span className="text-lg">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
};
