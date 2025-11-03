/**
 * Dashboard admin - Redesigned with Notion/Shadcn aesthetic
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GroupMetadata } from '@/types/group';

export default function AdminDashboardPage() {
  const [groups, setGroups] = useState<GroupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadGroups = () => {
    fetch('/api/admin/groups')
      .then(res => res.json())
      .then(data => {
        console.log('[DASHBOARD] API response:', data);
        if (data.success && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          console.warn('[DASHBOARD] Invalid groups data, using empty array');
          setGroups([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('[DASHBOARD] Error fetching groups:', err);
        setGroups([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    setDeletingId(groupId);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Non autorisé');
      setDeletingId(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Recharger la liste des groupes
        loadGroups();
      } else {
        alert('Erreur lors de la suppression : ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Erreur lors de la suppression du groupe');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-1">Gérez vos groupes d'entreprises</p>
          </div>

          <Link
            href="/admin/groups/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors"
          >
            + Nouveau groupe
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups && Array.isArray(groups) && groups.map(group => (
            <div
              key={group.id}
              className="bg-card rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all relative group"
            >
              {/* Bouton de suppression - en haut à droite */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteGroup(group.id, group.name);
                }}
                disabled={deletingId === group.id}
                className="absolute top-3 right-3 z-10 p-2 bg-card border border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Supprimer ce groupe"
              >
                {deletingId === group.id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              <Link
                href={`/admin/groups/${group.id}`}
                className="block p-6 pr-14"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {group.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {group.dilitrustModules.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Modules : {group.dilitrustModules.join(', ')}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{group.isPublic ? '🌐 Public' : '🔒 Privé'}</span>
                  <span>{new Date(group.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground mb-4">Aucun groupe créé</p>
            <Link
              href="/admin/groups/new"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Créer votre premier groupe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
