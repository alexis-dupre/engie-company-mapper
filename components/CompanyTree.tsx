'use client';

/**
 * Composant arbre hiérarchique - Redesigned with Notion/Shadcn aesthetic
 */

import React, { useState } from 'react';
import { Company } from '../types/company';
import type { CustomTag } from '../types/company';

interface CompanyTreeProps {
  company: Company;
  onCompanySelect?: (company: Company) => void;
  selectedId?: string;
  customTags?: Record<string, CustomTag[]>;
  isAdminMode?: boolean;
  onManageTags?: (company: Company) => void;
}

interface TreeNodeProps {
  company: Company;
  onCompanySelect?: (company: Company) => void;
  selectedId?: string;
  isRoot?: boolean;
  customTags?: Record<string, CustomTag[]>;
  isAdminMode?: boolean;
  onManageTags?: (company: Company) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  company,
  onCompanySelect,
  selectedId,
  isRoot = false,
  customTags = {},
  isAdminMode = false,
  onManageTags,
}) => {
  const [isExpanded, setIsExpanded] = useState(isRoot || company.depth === 0);
  const hasChildren = company.subsidiaries && company.subsidiaries.length > 0;
  const isSelected = company.accountId === selectedId;

  // Styles according to depth - subtle pastel colors
  const depthStyles = [
    { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-900 dark:text-blue-100' },
    { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-900 dark:text-green-100' },
    { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-900 dark:text-purple-100' },
  ];

  const style = depthStyles[company.depth] || {
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-foreground'
  };

  return (
    <div className="relative">
      {/* Company node */}
      <div className="flex items-center gap-2 mb-2">
        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors"
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            <span className="text-xs font-bold text-muted-foreground">
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        )}

        {/* Company card */}
        <div
          onClick={() => onCompanySelect?.(company)}
          className={`
            flex-1 p-3 rounded-md border cursor-pointer transition-all
            ${style.bg} ${style.border} ${style.text}
            ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : 'hover:shadow-sm'}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{company.name}</h4>
              <p className="text-xs opacity-75">{company.tag}</p>
            </div>

            {/* Subsidiaries counter */}
            {hasChildren && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs opacity-75">🏢</span>
                <span className="text-xs font-medium">{company.subsidiaries.length}</span>
              </div>
            )}

            {/* Tags counter */}
            {customTags[company.accountId] && customTags[company.accountId].length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs opacity-75">🏷️</span>
                <span className="text-xs font-medium">{customTags[company.accountId].length}</span>
              </div>
            )}
          </div>

          {/* Compact info */}
          <div className="flex gap-3 mt-2 text-xs opacity-75">
            <span>ID: {company.accountId}</span>
            {company.website && <span>🔗</span>}
          </div>
        </div>
      </div>

      {/* Subsidiaries (children) */}
      {hasChildren && isExpanded && (
        <div className="ml-8 border-l border-border pl-4 space-y-2">
          {company.subsidiaries.map(sub => (
            <TreeNode
              key={sub.accountId}
              company={sub}
              onCompanySelect={onCompanySelect}
              selectedId={selectedId}
              customTags={customTags}
              isAdminMode={isAdminMode}
              onManageTags={onManageTags}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CompanyTree: React.FC<CompanyTreeProps> = ({
  company,
  onCompanySelect,
  selectedId,
  customTags = {},
  isAdminMode = false,
  onManageTags,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max p-4">
        <TreeNode
          company={company}
          onCompanySelect={onCompanySelect}
          selectedId={selectedId}
          isRoot
          customTags={customTags}
          isAdminMode={isAdminMode}
          onManageTags={onManageTags}
        />
      </div>
    </div>
  );
};
