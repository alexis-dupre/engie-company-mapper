'use client';

/**
 * Composant carte d'entreprise - Affiche les informations d'une entreprise
 * Redesigned with Notion/Shadcn aesthetic
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

  // Helper functions for custom tags
  const getTagLabel = (tag: CustomTag) => {
    if (tag.type === 'CUSTOM' && tag.customName) {
      return tag.customName;
    }

    // For CLIENT_DILITRUST, integrate modules into the label
    if (tag.type === 'CLIENT_DILITRUST' && tag.modules && tag.modules.length > 0) {
      return `${TAG_LABELS[tag.type]} (${tag.modules.join(', ')})`;
    }

    return TAG_LABELS[tag.type];
  };

  const getTagColor = (tag: CustomTag) => {
    if (tag.type === 'CUSTOM' && tag.customColor) {
      return `bg-gradient-to-r ${tag.customColor} text-white`;
    }
    // Use subtle colors for predefined tags
    if (tag.type === 'TOP20') return 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300';
    if (tag.type === 'TOP50') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (tag.type === 'CLIENT_DILITRUST') return 'bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-300';
    return 'bg-secondary text-secondary-foreground';
  };

  const selectedClass = isSelected ? 'ring-2 ring-ring' : '';

  return (
    <div
      className={`group bg-card border border-border rounded-lg p-5 hover:border-foreground/20 cursor-pointer transition-all ${selectedClass}`}
      onClick={() => onSelect?.(company)}
    >
      {/* En-tête */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-base text-foreground mb-1 group-hover:text-foreground/80 transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-muted-foreground">{company.tag}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded">
              Niveau {company.depth}
            </span>
            {international && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
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
        <div className="flex flex-wrap gap-1.5 mb-4">
          {customTags.map((tag, idx) => (
            <span
              key={`${tag.type}-${tag.customName || idx}`}
              className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${getTagColor(tag)}`}
            >
              {getTagLabel(tag)}
              {tag.type === 'CUSTOM' && (
                <svg className="w-3 h-3 ml-1 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Commentaires */}
      {comments.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">{comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-muted border border-border rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  {comment.author && (
                    <>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {comment.author}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {revenue && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium">{revenue}</span>
          </div>
        )}
        {employees && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium">{employees}</span>
          </div>
        )}
        {showSubsidiaries && company.subsidiaries.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium">{company.subsidiaries.length} filiale{company.subsidiaries.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground font-medium truncate hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Site web
            </a>
          </div>
        )}
      </div>

      {/* Parent Company Info */}
      {company.parentCompany && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted rounded text-xs text-muted-foreground mb-4">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Filiale de <span className="font-medium text-foreground">{company.parentCompany.name}</span></span>
        </div>
      )}

      {/* Tags principaux */}
      {company.allTags.length > 0 && (
        <div className="pt-3 mt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {company.allTags.slice(0, 6).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium"
              >
                {tag}
              </span>
            ))}
            {company.allTags.length > 6 && (
              <span className="inline-flex items-center px-2 py-0.5 text-muted-foreground text-xs">
                +{company.allTags.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Boutons admin */}
      {isAdminMode && (onManageTags || onManageComments) && (
        <div className="pt-3 mt-3 border-t border-border flex gap-2">
          {onManageTags && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageTags();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium border border-border"
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
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium border border-border"
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
      <div className="pt-3 mt-3 border-t border-border">
        <a
          href={company.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium group/link transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Voir sur Nomination</span>
          <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
};
