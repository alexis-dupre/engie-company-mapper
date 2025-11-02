'use client';

/**
 * Composant carte d'entreprise - Affiche les informations d'une entreprise
 */

import React from 'react';
import { Company } from '../types/company';
import type { CustomTag, Comment } from '../types/company';
import { extractRevenue, extractEmployeeCount, isInternational } from '../utils/companyUtils';

interface CompanyCardProps {
  company: Company;
  onSelect?: (company: Company) => void;
  isSelected?: boolean;
  showSubsidiaries?: boolean;
  customTags?: CustomTag[];
  comments?: Comment[];
  isAdminMode?: boolean;
  onManageTags?: () => void;
  onManageComments?: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onSelect,
  isSelected = false,
  showSubsidiaries = true,
  customTags = [],
  comments = [],
  isAdminMode = false,
  onManageTags,
  onManageComments,
}) => {
  const revenue = extractRevenue(company.allTags);
  const employees = extractEmployeeCount(company.allTags);
  const international = isInternational(company);

  const TAG_LABELS: Record<string, string> = {
    TOP20: 'TOP 20',
    TOP50: 'TOP 50',
    CLIENT_DILITRUST: 'Client DiliTrust',
  };

  const TAG_COLORS: Record<string, string> = {
    TOP20: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    TOP50: 'bg-green-100 text-green-800 border-green-300',
    CLIENT_DILITRUST: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  // Couleur selon la profondeur
  const depthColors = [
    'bg-blue-50 border-blue-300',      // Niveau 0
    'bg-green-50 border-green-300',    // Niveau 1
    'bg-purple-50 border-purple-300',  // Niveau 2
  ];
  
  const colorClass = depthColors[company.depth] || 'bg-gray-50 border-gray-300';
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 shadow-lg' : '';
  
  return (
    <div 
      className={`border-2 rounded-lg p-4 mb-3 transition-all cursor-pointer hover:shadow-md ${colorClass} ${selectedClass}`}
      onClick={() => onSelect?.(company)}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-600">{company.tag}</p>
        </div>
        
        {/* Badges */}
        <div className="flex flex-col items-end gap-1">
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
            Niveau {company.depth}
          </span>
          {international && (
            <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">
              🌍 International
            </span>
          )}
        </div>
      </div>

      {/* Tags personnalisés */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {customTags.map((tag, idx) => (
            <div key={idx} className="flex flex-col">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${TAG_COLORS[tag.type]}`}>
                {TAG_LABELS[tag.type]}
              </span>
              {tag.modules && tag.modules.length > 0 && (
                <span className="text-xs text-gray-600 mt-1">
                  {tag.modules.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Commentaires */}
      {comments.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>💬</span>
            <span>{comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <div className="text-xs text-gray-500 mb-1">
                  {comment.author && (
                    <span className="font-medium text-gray-700">
                      {comment.author} •{' '}
                    </span>
                  )}
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        {revenue && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">💰</span>
            <span className="text-gray-700">{revenue}</span>
          </div>
        )}
        {employees && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">👥</span>
            <span className="text-gray-700">{employees}</span>
          </div>
        )}
        {showSubsidiaries && company.subsidiaries.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">🏢</span>
            <span className="text-gray-700">{company.subsidiaries.length} filiale(s)</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">🔗</span>
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              Site web
            </a>
          </div>
        )}
      </div>
      
      {/* Parent */}
      {company.parentCompany && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="mr-1">↳</span>
          Filiale de: <span className="font-medium">{company.parentCompany.name}</span>
        </div>
      )}
      
      {/* Tags principaux */}
      <div className="flex flex-wrap gap-1 mt-2">
        {company.allTags.slice(0, 5).map((tag, idx) => (
          <span 
            key={idx}
            className="px-2 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {company.allTags.length > 5 && (
          <span className="px-2 py-0.5 text-gray-500 text-xs">
            +{company.allTags.length - 5} autres
          </span>
        )}
      </div>

      {/* Debug logging */}
      {(() => {
        console.log('[CompanyCard]', company.name, 'isAdminMode:', isAdminMode, 'onManageTags:', !!onManageTags);
        return null;
      })()}

      {/* Boutons admin */}
      {isAdminMode && (onManageTags || onManageComments) && (
        <div className="mt-3 flex gap-2">
          {onManageTags && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageTags();
              }}
              className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              🏷️ Gérer les tags
            </button>
          )}
          {onManageComments && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageComments();
              }}
              className="flex-1 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              💬 Gérer les commentaires
            </button>
          )}
        </div>
      )}

      {/* Liens */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
        <a
          href={company.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Voir sur Nomination →
        </a>
      </div>
    </div>
  );
};
