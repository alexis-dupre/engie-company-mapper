/**
 * Utilitaires pour l'analyse et la manipulation des données d'entreprise
 */

import { Company, CompanyStats, FilterOptions } from '../types/company';

/**
 * Extrait toutes les entreprises dans un tableau plat
 */
export function flattenCompanies(company: Company): Company[] {
  const result: Company[] = [company];
  
  if (company.subsidiaries && company.subsidiaries.length > 0) {
    company.subsidiaries.forEach(sub => {
      result.push(...flattenCompanies(sub));
    });
  }
  
  return result;
}

/**
 * Calcule les statistiques globales
 */
export function calculateStats(company: Company): CompanyStats {
  const allCompanies = flattenCompanies(company);
  
  const stats: CompanyStats = {
    totalCompanies: allCompanies.length,
    maxDepth: Math.max(...allCompanies.map(c => c.depth)),
    companiesByDepth: {},
    companiesBySector: {},
    companiesBySize: {},
    companiesWithWebsite: allCompanies.filter(c => c.website).length,
    internationalCompanies: allCompanies.filter(c => 
      c.allTags.some(tag => tag.includes('international'))
    ).length,
  };
  
  // Grouper par profondeur
  allCompanies.forEach(c => {
    stats.companiesByDepth[c.depth] = (stats.companiesByDepth[c.depth] || 0) + 1;
  });
  
  // Grouper par secteur (tag principal)
  allCompanies.forEach(c => {
    const sector = c.tag || 'Non classé';
    stats.companiesBySector[sector] = (stats.companiesBySector[sector] || 0) + 1;
  });
  
  // Grouper par taille
  allCompanies.forEach(c => {
    const sizeTag = c.allTags.find(tag => 
      tag.includes('salariés') || 
      tag.includes('PME') || 
      tag.includes('ETI') || 
      tag.includes('Grande entreprise')
    ) || 'Taille inconnue';
    stats.companiesBySize[sizeTag] = (stats.companiesBySize[sizeTag] || 0) + 1;
  });
  
  return stats;
}

/**
 * Extrait les secteurs uniques
 */
export function getUniqueSectors(company: Company): string[] {
  const allCompanies = flattenCompanies(company);
  const sectors = new Set(allCompanies.map(c => c.tag).filter(Boolean));
  return Array.from(sectors).sort();
}

/**
 * Extrait les tailles d'entreprise uniques
 */
export function getUniqueSizes(company: Company): string[] {
  const allCompanies = flattenCompanies(company);
  const sizes = new Set<string>();
  
  allCompanies.forEach(c => {
    const sizeTag = c.allTags.find(tag => 
      tag.includes('salariés') || 
      tag.includes('PME') || 
      tag.includes('ETI') || 
      tag.includes('Grande entreprise')
    );
    if (sizeTag) sizes.add(sizeTag);
  });
  
  return Array.from(sizes).sort();
}

/**
 * Filtre les entreprises selon les critères
 */
export function filterCompanies(company: Company, filters: FilterOptions): Company {
  // Clone l'entreprise pour ne pas modifier l'original
  const filtered = { ...company };
  
  // Filtre les filiales récursivement
  filtered.subsidiaries = company.subsidiaries
    .map(sub => filterCompanies(sub, filters))
    .filter(sub => matchesFilters(sub, filters) || hasMatchingDescendant(sub, filters));
  
  return filtered;
}

/**
 * Vérifie si une entreprise correspond aux filtres
 */
function matchesFilters(company: Company, filters: FilterOptions): boolean {
  // Recherche textuelle
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    const matchesName = company.name.toLowerCase().includes(term);
    const matchesTags = company.allTags.some(tag => tag.toLowerCase().includes(term));
    if (!matchesName && !matchesTags) return false;
  }
  
  // Filtre par secteur
  if (filters.sector && company.tag !== filters.sector) {
    return false;
  }
  
  // Filtre par profondeur
  if (filters.depth !== null && company.depth !== filters.depth) {
    return false;
  }
  
  // Filtre par taille
  if (filters.size) {
    const hasSize = company.allTags.some(tag => tag === filters.size);
    if (!hasSize) return false;
  }
  
  // Filtre par présence de website
  if (filters.hasWebsite !== null) {
    const hasWebsite = company.website !== null;
    if (hasWebsite !== filters.hasWebsite) return false;
  }
  
  return true;
}

/**
 * Vérifie si une entreprise a un descendant qui correspond aux filtres
 */
function hasMatchingDescendant(company: Company, filters: FilterOptions): boolean {
  if (matchesFilters(company, filters)) return true;
  
  return company.subsidiaries.some(sub => hasMatchingDescendant(sub, filters));
}

/**
 * Extrait les tags les plus fréquents
 */
export function getTopTags(company: Company, limit: number = 10): Array<{ tag: string; count: number }> {
  const allCompanies = flattenCompanies(company);
  const tagCounts = new Map<string, number>();
  
  allCompanies.forEach(c => {
    c.allTags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Trouve une entreprise par son accountId
 */
export function findCompanyById(company: Company, accountId: string): Company | null {
  if (company.accountId === accountId) return company;
  
  for (const sub of company.subsidiaries) {
    const found = findCompanyById(sub, accountId);
    if (found) return found;
  }
  
  return null;
}

/**
 * Construit le chemin complet d'une entreprise (breadcrumb)
 */
export function getCompanyPath(rootCompany: Company, targetId: string): Company[] {
  function buildPath(company: Company, path: Company[]): Company[] | null {
    const newPath = [...path, company];
    
    if (company.accountId === targetId) {
      return newPath;
    }
    
    for (const sub of company.subsidiaries) {
      const found = buildPath(sub, newPath);
      if (found) return found;
    }
    
    return null;
  }
  
  return buildPath(rootCompany, []) || [];
}

/**
 * Calcule la profondeur d'une branche
 */
export function calculateBranchDepth(company: Company): number {
  if (!company.subsidiaries || company.subsidiaries.length === 0) {
    return 0;
  }
  
  return 1 + Math.max(...company.subsidiaries.map(sub => calculateBranchDepth(sub)));
}

/**
 * Formate le CA à partir des tags
 */
export function extractRevenue(tags: string[]): string | null {
  const revenueTag = tags.find(tag => tag.includes('CA '));
  return revenueTag || null;
}

/**
 * Extrait le nombre d'employés à partir des tags
 */
export function extractEmployeeCount(tags: string[]): string | null {
  const employeeTag = tags.find(tag => tag.includes('salariés'));
  return employeeTag || null;
}

/**
 * Détermine si une entreprise est internationale
 */
export function isInternational(company: Company): boolean {
  return company.allTags.some(tag => 
    tag.toLowerCase().includes('international') || 
    tag.toLowerCase().includes('étranger')
  );
}

/**
 * Export des données en CSV
 */
export function exportToCSV(company: Company): string {
  const allCompanies = flattenCompanies(company);
  
  const headers = [
    'ID',
    'Nom',
    'Secteur',
    'Profondeur',
    'Parent',
    'Nombre de filiales',
    'Website',
    'CA',
    'Employés',
    'International',
    'Tags'
  ].join(',');
  
  const rows = allCompanies.map(c => [
    c.accountId,
    `"${c.name}"`,
    `"${c.tag || ''}"`,
    c.depth,
    `"${c.parentCompany?.name || ''}"`,
    c.subsidiaries.length,
    `"${c.website || ''}"`,
    `"${extractRevenue(c.allTags) || ''}"`,
    `"${extractEmployeeCount(c.allTags) || ''}"`,
    isInternational(c) ? 'Oui' : 'Non',
    `"${c.allTags.join('; ')}"`,
  ].join(','));
  
  return [headers, ...rows].join('\n');
}
