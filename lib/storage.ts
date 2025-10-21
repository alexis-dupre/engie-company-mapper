import { Redis } from '@upstash/redis';
import type { CompanyTags, CustomTag, TagType } from '../types/company';

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

// Initialiser Redis avec les variables d'environnement Vercel
const redis = Redis.fromEnv();

export const storage = {
  async getGroup(id: string): Promise<Group | null> {
    try {
      const group = await redis.get<Group>(`group:${id}`);
      return group;
    } catch (error) {
      console.error('Error getting group:', error);
      return null;
    }
  },

  async getAllGroups(): Promise<Group[]> {
    try {
      const keys = await redis.keys('group:*');
      if (keys.length === 0) return [];

      const groups = await Promise.all(
        keys.map(key => redis.get<Group>(key))
      );

      return groups.filter(Boolean) as Group[];
    } catch (error) {
      console.error('Error getting all groups:', error);
      return [];
    }
  },

  async saveGroup(group: Group): Promise<void> {
    try {
      await redis.set(`group:${group.id}`, {
        ...group,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error saving group:', error);
      throw error;
    }
  },

  async deleteGroup(id: string): Promise<void> {
    try {
      await redis.del(`group:${id}`);
      await redis.del(`comments:${id}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  async getComments(groupId: string): Promise<Comment[]> {
    try {
      const comments = await redis.get<Comment[]>(`comments:${groupId}`);
      return comments || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },

  async addComment(comment: Comment): Promise<void> {
    try {
      const comments = await this.getComments(comment.groupId);
      comments.push(comment);
      await redis.set(`comments:${comment.groupId}`, comments);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async deleteComment(groupId: string, commentId: string): Promise<void> {
    try {
      const comments = await this.getComments(groupId);
      const filtered = comments.filter(c => c.id !== commentId);
      await redis.set(`comments:${groupId}`, filtered);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  async updateComment(groupId: string, commentId: string, content: string): Promise<void> {
    try {
      const comments = await this.getComments(groupId);
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.content = content;
        await redis.set(`comments:${groupId}`, comments);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  async getGroupTags(groupId: string): Promise<CompanyTags> {
    try {
      const tags = await redis.get<CompanyTags>(`tags:${groupId}`);
      return tags || {};
    } catch (error) {
      console.error('Error getting tags:', error);
      return {};
    }
  },

  async saveGroupTags(groupId: string, tags: CompanyTags): Promise<void> {
    try {
      await redis.set(`tags:${groupId}`, tags);
    } catch (error) {
      console.error('Error saving tags:', error);
      throw error;
    }
  },

  async addTagToCompany(groupId: string, companyId: string, tag: CustomTag): Promise<void> {
    try {
      const tags = await this.getGroupTags(groupId);
      if (!tags[companyId]) {
        tags[companyId] = [];
      }
      // Éviter les doublons du même type
      tags[companyId] = tags[companyId].filter(t => t.type !== tag.type);
      tags[companyId].push(tag);
      await this.saveGroupTags(groupId, tags);
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  },

  async removeTagFromCompany(groupId: string, companyId: string, tagType: TagType): Promise<void> {
    try {
      const tags = await this.getGroupTags(groupId);
      if (tags[companyId]) {
        tags[companyId] = tags[companyId].filter(t => t.type !== tagType);
        if (tags[companyId].length === 0) {
          delete tags[companyId];
        }
        await this.saveGroupTags(groupId, tags);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  },
};
