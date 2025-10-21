'use client';

/**
 * Composant arbre hiérarchique - Visualisation de la structure organisationnelle
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
  
  // Styles selon la profondeur
  const depthStyles = [
    { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900' },
    { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-900' },
    { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900' },
  ];
  
  const style = depthStyles[company.depth] || { 
    bg: 'bg-gray-100', 
    border: 'border-gray-400', 
    text: 'text-gray-900' 
  };
  
  return (
    <div className="relative">
      {/* Nœud de l'entreprise */}
      <div className="flex items-center gap-2 mb-2">
        {/* Bouton d'expansion */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            <span className="text-xs font-bold">
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        )}
        
        {/* Carte de l'entreprise */}
        <div
          onClick={() => onCompanySelect?.(company)}
          className={`
            flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all
            ${style.bg} ${style.border} ${style.text}
            ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{company.name}</h4>
              <p className="text-xs opacity-75">{company.tag}</p>
            </div>
            
            {/* Compteur de filiales */}
            {hasChildren && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs opacity-75">🏢</span>
                <span className="text-xs font-medium">{company.subsidiaries.length}</span>
              </div>
            )}

            {/* Compteur de tags */}
            {customTags[company.accountId] && customTags[company.accountId].length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs opacity-75">🏷️</span>
                <span className="text-xs font-medium">{customTags[company.accountId].length}</span>
              </div>
            )}
          </div>
          
          {/* Informations compactes */}
          <div className="flex gap-3 mt-2 text-xs opacity-75">
            <span>ID: {company.accountId}</span>
            {company.website && <span>🔗</span>}
          </div>
        </div>
      </div>
      
      {/* Filiales (enfants) */}
      {hasChildren && isExpanded && (
        <div className="ml-8 border-l-2 border-gray-300 pl-4 space-y-2">
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
