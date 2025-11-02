'use client';

/**
 * Composant carte d'entreprise - Affiche les informations d'une entreprise
 * Redesigned with modern Airbnb-inspired aesthetic
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
    TOP20: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    TOP50: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    CLIENT_DILITRUST: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
  };

  // Design moderne sans couleur de fond selon profondeur
  const selectedClass = isSelected ? 'ring-2 ring-pink-500 shadow-xl scale-[1.02]' : '';

  return (
    <div
      className={`group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1 ${selectedClass}`}
      onClick={() => onSelect?.(company)}
    >
      {/* Depth indicator - thin colored bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
        company.depth === 0 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
        company.depth === 1 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
        'bg-gradient-to-r from-blue-500 to-cyan-500'
      }`} />

      {/* En-tête */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-gray-500">{company.tag}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              Niveau {company.depth}
            </span>
            {international && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
                International
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tags personnalisés */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {customTags.map((tag, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${TAG_COLORS[tag.type]}`}>
                {TAG_LABELS[tag.type]}
              </span>
              {tag.modules && tag.modules.length > 0 && (
                <span className="text-xs text-gray-500 pl-1">
                  {tag.modules.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Commentaires */}
      {comments.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  {comment.author && (
                    <>
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {comment.author}
                      </span>
                      <span className="text-gray-400">•</span>
                    </>
                  )}
                  <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {revenue && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">{revenue}</span>
          </div>
        )}
        {employees && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">{employees}</span>
          </div>
        )}
        {showSubsidiaries && company.subsidiaries.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">{company.subsidiaries.length} filiale{company.subsidiaries.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium truncate hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Site web
            </a>
          </div>
        )}
      </div>
      
      {/* Parent Company Info */}
      {company.parentCompany && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 mb-4">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Filiale de <span className="font-semibold text-gray-800">{company.parentCompany.name}</span></span>
        </div>
      )}

      {/* Tags principaux - Divider */}
      {company.allTags.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {company.allTags.slice(0, 6).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {tag}
              </span>
            ))}
            {company.allTags.length > 6 && (
              <span className="inline-flex items-center px-2.5 py-1 text-gray-400 text-xs">
                +{company.allTags.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Boutons admin */}
      {isAdminMode && (onManageTags || onManageComments) && (
        <div className="pt-4 mt-4 border-t border-gray-100 flex gap-2">
          {onManageTags && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageTags();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Tags</span>
            </button>
          )}
          {onManageComments && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageComments();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Commentaires</span>
            </button>
          )}
        </div>
      )}

      {/* Lien Nomination */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <a
          href={company.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 font-medium group transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Voir sur Nomination</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
};
