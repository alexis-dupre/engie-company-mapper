/**
 * Types pour le système multi-groupes avec administration
 */

import { CompanyData } from './company';

// Tags personnalisés disponibles
export type GroupTag = 'TOP20' | 'TOP50' | 'CLIENT_DILITRUST';

// Modules DiliTrust
export type DiliTrustModule = 'BP' | 'CLM' | 'LEM' | 'ELM' | 'DATAROOM';

// Métadonnées d'un groupe
export interface GroupMetadata {
  id: string;
  name: string;
  description?: string;
  tags: GroupTag[];
  dilitrustModules: DiliTrustModule[];
  comments: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Groupe complet avec données
export interface Group {
  metadata: GroupMetadata;
  data: CompanyData;
}

// Commentaire sur une entreprise spécifique
export interface CompanyComment {
  id: string;
  groupId: string;
  companyAccountId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Structure du fichier metadata.json
export interface MetadataStore {
  groups: Record<string, GroupMetadata>;
  comments: Record<string, CompanyComment[]>; // Key: groupId
  config: {
    adminEmail?: string;
    siteName: string;
    lastUpdated: string;
  };
}

// Types pour les formulaires
export interface GroupFormData {
  name: string;
  description: string;
  tags: GroupTag[];
  dilitrustModules: DiliTrustModule[];
  comments: string;
  isPublic: boolean;
  jsonFile: File | null;
}

// Types pour les API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GroupListResponse {
  groups: GroupMetadata[];
  total: number;
}

export interface GroupDetailResponse {
  group: Group;
  comments: CompanyComment[];
}

// Types pour l'authentification
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AuthSession {
  user: AdminUser;
  expiresAt: string;
}
