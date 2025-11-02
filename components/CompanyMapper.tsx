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
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {data.company.name} - Mapping organisationnel
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {allCompanies.length} entreprise{allCompanies.length > 1 ? 's' : ''} • 
                Dernière mise à jour: {new Date(data.metadata.endTime).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <span>📥</span>
              Exporter CSV
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
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Arbre hiérarchique
              </h2>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Liste des entreprises ({allCompanies.length})
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
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">Aucune entreprise ne correspond aux critères</p>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'detail' && selectedCompany && (
            <div className="space-y-4">
              {/* Breadcrumb */}
              {selectedPath.length > 1 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    {selectedPath.map((company, idx) => (
                      <React.Fragment key={company.accountId}>
                        <button
                          onClick={() => handleCompanySelect(company)}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {company.name}
                        </button>
                        {idx < selectedPath.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Détails de l'entreprise */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Tous les tags ({selectedCompany.allTags.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.allTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Filiales directes */}
              {selectedCompany.subsidiaries.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Filiales directes ({selectedCompany.subsidiaries.length})
                  </h3>
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

// Bouton d'onglet
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
        px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
        flex items-center gap-2
        ${active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};
