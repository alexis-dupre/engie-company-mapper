import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface Group {
  id: string;
  name: string;
  data: any;
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  groupId: string;
  content: string;
  author: string;
  createdAt: number;
}

// Utiliser /tmp sur Vercel (seul répertoire writable)
const STORAGE_DIR = '/tmp/company-mapper';
const GROUPS_FILE = path.join(STORAGE_DIR, 'groups.json');
const COMMENTS_FILE = path.join(STORAGE_DIR, 'comments.json');

async function ensureStorageExists() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

async function readGroups(): Promise<Record<string, Group>> {
  try {
    await ensureStorageExists();
    if (!existsSync(GROUPS_FILE)) {
      return {};
    }
    const data = await readFile(GROUPS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading groups:', error);
    return {};
  }
}

async function writeGroups(groups: Record<string, Group>) {
  try {
    await ensureStorageExists();
    await writeFile(GROUPS_FILE, JSON.stringify(groups, null, 2));
  } catch (error) {
    console.error('Error writing groups:', error);
    throw error;
  }
}

async function readComments(): Promise<Record<string, Comment[]>> {
  try {
    await ensureStorageExists();
    if (!existsSync(COMMENTS_FILE)) {
      return {};
    }
    const data = await readFile(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading comments:', error);
    return {};
  }
}

async function writeComments(comments: Record<string, Comment[]>) {
  try {
    await ensureStorageExists();
    await writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error('Error writing comments:', error);
    throw error;
  }
}

export const storage = {
  async getGroup(id: string): Promise<Group | null> {
    const groups = await readGroups();
    return groups[id] || null;
  },

  async getAllGroups(): Promise<Group[]> {
    const groups = await readGroups();
    return Object.values(groups);
  },

  async saveGroup(group: Group): Promise<void> {
    const groups = await readGroups();
    groups[group.id] = { ...group, updatedAt: Date.now() };
    await writeGroups(groups);
  },

  async deleteGroup(id: string): Promise<void> {
    const groups = await readGroups();
    delete groups[id];
    await writeGroups(groups);

    const comments = await readComments();
    delete comments[id];
    await writeComments(comments);
  },

  async getComments(groupId: string): Promise<Comment[]> {
    const comments = await readComments();
    return comments[groupId] || [];
  },

  async addComment(comment: Comment): Promise<void> {
    const comments = await readComments();
    if (!comments[comment.groupId]) {
      comments[comment.groupId] = [];
    }
    comments[comment.groupId].push(comment);
    await writeComments(comments);
  },

  async deleteComment(groupId: string, commentId: string): Promise<void> {
    const comments = await readComments();
    if (comments[groupId]) {
      comments[groupId] = comments[groupId].filter(c => c.id !== commentId);
      await writeComments(comments);
    }
  },

  async updateComment(groupId: string, commentId: string, content: string): Promise<void> {
    const comments = await readComments();
    if (comments[groupId]) {
      const comment = comments[groupId].find(c => c.id === commentId);
      if (comment) {
        comment.content = content;
        await writeComments(comments);
      }
    }
  },
};
