/**
 * Types pour la structure des données d'entreprise Nomination
 */

export interface ParentCompany {
  name: string;
  nominationLink: string;
}

export interface Company {
  accountId: string;
  name: string;
  allTags: string[];
  depth: number;
  parentCompany: ParentCompany | null;
  profileUrl: string;
  subsidiaries: Company[];
  tag: string;
  website: string | null;
}

export interface ScrapingMetadata {
  duration: number;
  endTime: number;
  errors: any[];
  maxDepth: number;
  startTime: number;
  status: string;
  totalCompaniesScraped: number;
  urlsVisited: string[];
}

export interface CompanyData {
  company: Company;
  metadata: ScrapingMetadata;
}

// Types pour les statistiques calculées
export interface CompanyStats {
  totalCompanies: number;
  maxDepth: number;
  companiesByDepth: Record<number, number>;
  companiesBySector: Record<string, number>;
  companiesBySize: Record<string, number>;
  companiesWithWebsite: number;
  internationalCompanies: number;
}

// Types pour les filtres
export interface FilterOptions {
  searchTerm: string;
  sector: string | null;
  depth: number | null;
  size: string | null;
  hasWebsite: boolean | null;
}
