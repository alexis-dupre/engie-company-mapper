/**
 * Utilitaires pour la gestion du stockage des groupes et métadonnées
 */

import fs from 'fs/promises';
import path from 'path';
import { Group, GroupMetadata, MetadataStore, CompanyComment } from '@/types/group';
import { CompanyData } from '@/types/company';

const DATA_DIR = path.join(process.cwd(), 'data');
const GROUPS_DIR = path.join(DATA_DIR, 'groups');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

/**
 * Initialise les dossiers de données s'ils n'existent pas
 */
export async function initStorage(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(GROUPS_DIR, { recursive: true });

    // Créer metadata.json s'il n'existe pas
    try {
      await fs.access(METADATA_FILE);
    } catch {
      const initialMetadata: MetadataStore = {
        groups: {},
        comments: {},
        config: {
          siteName: 'Company Mapper',
          lastUpdated: new Date().toISOString(),
        },
      };
      await fs.writeFile(METADATA_FILE, JSON.stringify(initialMetadata, null, 2));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

/**
 * Lit le fichier metadata.json
 */
export async function readMetadata(): Promise<MetadataStore> {
  try {
    const content = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading metadata:', error);
    throw error;
  }
}

/**
 * Écrit dans le fichier metadata.json
 */
export async function writeMetadata(metadata: MetadataStore): Promise<void> {
  try {
    metadata.config.lastUpdated = new Date().toISOString();
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error writing metadata:', error);
    throw error;
  }
}

/**
 * Récupère tous les groupes (métadonnées uniquement)
 */
export async function getAllGroupsMetadata(publicOnly: boolean = false): Promise<GroupMetadata[]> {
  const metadata = await readMetadata();
  const groups = Object.values(metadata.groups);

  if (publicOnly) {
    return groups.filter(g => g.isPublic);
  }

  return groups;
}

/**
 * Récupère un groupe complet (métadonnées + données)
 */
export async function getGroupById(groupId: string): Promise<Group | null> {
  try {
    const metadata = await readMetadata();
    const groupMetadata = metadata.groups[groupId];

    if (!groupMetadata) {
      return null;
    }

    const dataPath = path.join(GROUPS_DIR, `${groupId}.json`);
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    const data: CompanyData = JSON.parse(dataContent);

    return {
      metadata: groupMetadata,
      data,
    };
  } catch (error) {
    console.error(`Error getting group ${groupId}:`, error);
    return null;
  }
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

  // Sauvegarder les données du groupe
  const dataPath = path.join(GROUPS_DIR, `${groupId}.json`);
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

  // Mettre à jour les métadonnées
  const metadata = await readMetadata();
  metadata.groups[groupId] = groupMetadata;
  await writeMetadata(metadata);

  return groupMetadata;
}

/**
 * Met à jour un groupe existant
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Omit<GroupMetadata, 'id' | 'createdAt' | 'updatedAt'>>,
  newData?: CompanyData
): Promise<GroupMetadata | null> {
  const metadata = await readMetadata();
  const existingGroup = metadata.groups[groupId];

  if (!existingGroup) {
    return null;
  }

  // Mettre à jour les métadonnées
  const updatedGroup: GroupMetadata = {
    ...existingGroup,
    ...updates,
    id: groupId,
    createdAt: existingGroup.createdAt,
    updatedAt: new Date().toISOString(),
  };

  metadata.groups[groupId] = updatedGroup;
  await writeMetadata(metadata);

  // Mettre à jour les données si fournies
  if (newData) {
    const dataPath = path.join(GROUPS_DIR, `${groupId}.json`);
    await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
  }

  return updatedGroup;
}

/**
 * Supprime un groupe
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  try {
    const metadata = await readMetadata();

    if (!metadata.groups[groupId]) {
      return false;
    }

    // Supprimer les données
    const dataPath = path.join(GROUPS_DIR, `${groupId}.json`);
    await fs.unlink(dataPath);

    // Supprimer les métadonnées
    delete metadata.groups[groupId];
    delete metadata.comments[groupId];
    await writeMetadata(metadata);

    return true;
  } catch (error) {
    console.error(`Error deleting group ${groupId}:`, error);
    return false;
  }
}

/**
 * Récupère les commentaires d'un groupe
 */
export async function getGroupComments(groupId: string): Promise<CompanyComment[]> {
  const metadata = await readMetadata();
  return metadata.comments[groupId] || [];
}

/**
 * Ajoute un commentaire sur une entreprise
 */
export async function addComment(
  groupId: string,
  companyAccountId: string,
  comment: string
): Promise<CompanyComment> {
  const metadata = await readMetadata();

  if (!metadata.comments[groupId]) {
    metadata.comments[groupId] = [];
  }

  const newComment: CompanyComment = {
    id: generateCommentId(),
    groupId,
    companyAccountId,
    comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  metadata.comments[groupId].push(newComment);
  await writeMetadata(metadata);

  return newComment;
}

/**
 * Met à jour un commentaire
 */
export async function updateComment(
  groupId: string,
  commentId: string,
  newComment: string
): Promise<CompanyComment | null> {
  const metadata = await readMetadata();
  const comments = metadata.comments[groupId];

  if (!comments) {
    return null;
  }

  const commentIndex = comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return null;
  }

  comments[commentIndex] = {
    ...comments[commentIndex],
    comment: newComment,
    updatedAt: new Date().toISOString(),
  };

  await writeMetadata(metadata);
  return comments[commentIndex];
}

/**
 * Supprime un commentaire
 */
export async function deleteComment(groupId: string, commentId: string): Promise<boolean> {
  const metadata = await readMetadata();
  const comments = metadata.comments[groupId];

  if (!comments) {
    return false;
  }

  const filteredComments = comments.filter(c => c.id !== commentId);

  if (filteredComments.length === comments.length) {
    return false;
  }

  metadata.comments[groupId] = filteredComments;
  await writeMetadata(metadata);

  return true;
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
