import { Redis } from '@upstash/redis';

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
};
