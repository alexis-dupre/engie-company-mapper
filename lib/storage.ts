/**
 * Système de stockage en mémoire pour les groupes (simplifié pour Netlify)
 * Les données seront perdues au redémarrage - utilisez une vraie base de données en production
 */

import { Group, GroupMetadata, MetadataStore, CompanyComment } from '@/types/group';
import { CompanyData } from '@/types/company';

// Stockage en mémoire
const memoryStore: MetadataStore = {
  groups: {},
  comments: {},
  config: {
    siteName: 'Company Mapper',
    lastUpdated: new Date().toISOString(),
  },
};

// Stockage des données complètes des groupes
const groupsData: Record<string, CompanyData> = {};

/**
 * Initialise le stockage (no-op pour mémoire)
 */
export async function initStorage(): Promise<void> {
  // Rien à faire pour le stockage en mémoire
  return Promise.resolve();
}

/**
 * Lit les métadonnées
 */
export async function readMetadata(): Promise<MetadataStore> {
  return Promise.resolve(memoryStore);
}

/**
 * Écrit les métadonnées
 */
export async function writeMetadata(metadata: MetadataStore): Promise<void> {
  metadata.config.lastUpdated = new Date().toISOString();
  memoryStore.groups = metadata.groups;
  memoryStore.comments = metadata.comments;
  memoryStore.config = metadata.config;
  return Promise.resolve();
}

/**
 * Récupère tous les groupes (métadonnées uniquement)
 */
export async function getAllGroupsMetadata(publicOnly: boolean = false): Promise<GroupMetadata[]> {
  const groups = Object.values(memoryStore.groups);

  if (publicOnly) {
    return Promise.resolve(groups.filter(g => g.isPublic));
  }

  return Promise.resolve(groups);
}

/**
 * Récupère un groupe complet (métadonnées + données)
 */
export async function getGroupById(groupId: string): Promise<Group | null> {
  const groupMetadata = memoryStore.groups[groupId];

  if (!groupMetadata) {
    return Promise.resolve(null);
  }

  const data = groupsData[groupId];

  if (!data) {
    return Promise.resolve(null);
  }

  return Promise.resolve({
    metadata: groupMetadata,
    data,
  });
}

/**
 * Crée un nouveau groupe
 */
export async function createGroup(
  name: string,
  data: CompanyData,
  options: Partial<Omit<GroupMetadata, 'id' | 'name' | 'createdAt' | 'updatedAt'>> = {}
): Promise<GroupMetadata> {
  const groupId = generateGroupId(name);
  const now = new Date().toISOString();

  const groupMetadata: GroupMetadata = {
    id: groupId,
    name,
    description: options.description || '',
    tags: options.tags || [],
    dilitrustModules: options.dilitrustModules || [],
    comments: options.comments || '',
    isPublic: options.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  };

  // Sauvegarder en mémoire
  groupsData[groupId] = data;
  memoryStore.groups[groupId] = groupMetadata;

  return Promise.resolve(groupMetadata);
}

/**
 * Met à jour un groupe existant
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Omit<GroupMetadata, 'id' | 'createdAt' | 'updatedAt'>>,
  newData?: CompanyData
): Promise<GroupMetadata | null> {
  const existingGroup = memoryStore.groups[groupId];

  if (!existingGroup) {
    return Promise.resolve(null);
  }

  // Mettre à jour les métadonnées
  const updatedGroup: GroupMetadata = {
    ...existingGroup,
    ...updates,
    id: groupId,
    createdAt: existingGroup.createdAt,
    updatedAt: new Date().toISOString(),
  };

  memoryStore.groups[groupId] = updatedGroup;

  // Mettre à jour les données si fournies
  if (newData) {
    groupsData[groupId] = newData;
  }

  return Promise.resolve(updatedGroup);
}

/**
 * Supprime un groupe
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  if (!memoryStore.groups[groupId]) {
    return Promise.resolve(false);
  }

  // Supprimer les données
  delete groupsData[groupId];
  delete memoryStore.groups[groupId];
  delete memoryStore.comments[groupId];

  return Promise.resolve(true);
}

/**
 * Récupère les commentaires d'un groupe
 */
export async function getGroupComments(groupId: string): Promise<CompanyComment[]> {
  return Promise.resolve(memoryStore.comments[groupId] || []);
}

/**
 * Ajoute un commentaire sur une entreprise
 */
export async function addComment(
  groupId: string,
  companyAccountId: string,
  comment: string
): Promise<CompanyComment> {
  if (!memoryStore.comments[groupId]) {
    memoryStore.comments[groupId] = [];
  }

  const newComment: CompanyComment = {
    id: generateCommentId(),
    groupId,
    companyAccountId,
    comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.comments[groupId].push(newComment);

  return Promise.resolve(newComment);
}

/**
 * Met à jour un commentaire
 */
export async function updateComment(
  groupId: string,
  commentId: string,
  newComment: string
): Promise<CompanyComment | null> {
  const comments = memoryStore.comments[groupId];

  if (!comments) {
    return Promise.resolve(null);
  }

  const commentIndex = comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return Promise.resolve(null);
  }

  comments[commentIndex] = {
    ...comments[commentIndex],
    comment: newComment,
    updatedAt: new Date().toISOString(),
  };

  return Promise.resolve(comments[commentIndex]);
}

/**
 * Supprime un commentaire
 */
export async function deleteComment(groupId: string, commentId: string): Promise<boolean> {
  const comments = memoryStore.comments[groupId];

  if (!comments) {
    return Promise.resolve(false);
  }

  const filteredComments = comments.filter(c => c.id !== commentId);

  if (filteredComments.length === comments.length) {
    return Promise.resolve(false);
  }

  memoryStore.comments[groupId] = filteredComments;

  return Promise.resolve(true);
}

/**
 * Génère un ID unique pour un groupe basé sur son nom
 */
function generateGroupId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Génère un ID unique pour un commentaire
 */
function generateCommentId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valide un fichier JSON de groupe
 */
export function validateGroupData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Le fichier JSON est invalide' };
  }

  if (!data.company || typeof data.company !== 'object') {
    return { valid: false, error: 'Le fichier doit contenir un objet "company"' };
  }

  const requiredFields = ['accountId', 'name', 'allTags', 'depth', 'tag'];

  for (const field of requiredFields) {
    if (!(field in data.company)) {
      return { valid: false, error: `Le champ "company.${field}" est requis` };
    }
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    return { valid: false, error: 'Le fichier doit contenir un objet "metadata"' };
  }

  return { valid: true };
}
