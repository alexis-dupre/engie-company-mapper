/**
 * Composant Filtres - Recherche et filtrage des entreprises
 */

import React from 'react';
import { FilterOptions } from '../types/company';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sectors: string[];
  sizes: string[];
  maxDepth: number;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  sectors,
  sizes,
  maxDepth,
}) => {
  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };
  
  const resetFilters = () => {
    onFiltersChange({
      searchTerm: '',
      sector: null,
      depth: null,
      size: null,
      hasWebsite: null,
    });
  };
  
  const hasActiveFilters = 
    filters.searchTerm !== '' ||
    filters.sector !== null ||
    filters.depth !== null ||
    filters.size !== null ||
    filters.hasWebsite !== null;
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          🔍 Filtres et recherche
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Réinitialiser
          </button>
        )}
      </div>
      
      {/* Recherche textuelle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rechercher
        </label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          placeholder="Nom d'entreprise, secteur, tag..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      
      {/* Grille de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Secteur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secteur
          </label>
          <select
            value={filters.sector || ''}
            onChange={(e) => updateFilter('sector', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        
        {/* Profondeur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau hiérarchique
          </label>
          <select
            value={filters.depth !== null ? filters.depth : ''}
            onChange={(e) => updateFilter('depth', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Tous les niveaux</option>
            {Array.from({ length: maxDepth + 1 }, (_, i) => (
              <option key={i} value={i}>
                Niveau {i}
              </option>
            ))}
          </select>
        </div>
        
        {/* Taille */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille
          </label>
          <select
            value={filters.size || ''}
            onChange={(e) => updateFilter('size', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Toutes les tailles</option>
            {sizes.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        
        {/* Site web */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site web
          </label>
          <select
            value={filters.hasWebsite !== null ? (filters.hasWebsite ? 'true' : 'false') : ''}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter('hasWebsite', value === '' ? null : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Tous</option>
            <option value="true">Avec site web</option>
            <option value="false">Sans site web</option>
          </select>
        </div>
      </div>
      
      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Filtres actifs:</span>
          {filters.searchTerm && (
            <FilterBadge
              label={`Recherche: "${filters.searchTerm}"`}
              onRemove={() => updateFilter('searchTerm', '')}
            />
          )}
          {filters.sector && (
            <FilterBadge
              label={`Secteur: ${filters.sector}`}
              onRemove={() => updateFilter('sector', null)}
            />
          )}
          {filters.depth !== null && (
            <FilterBadge
              label={`Niveau: ${filters.depth}`}
              onRemove={() => updateFilter('depth', null)}
            />
          )}
          {filters.size && (
            <FilterBadge
              label={`Taille: ${filters.size}`}
              onRemove={() => updateFilter('size', null)}
            />
          )}
          {filters.hasWebsite !== null && (
            <FilterBadge
              label={filters.hasWebsite ? 'Avec site web' : 'Sans site web'}
              onRemove={() => updateFilter('hasWebsite', null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Badge de filtre actif
interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label="Supprimer le filtre"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </span>
  );
};
