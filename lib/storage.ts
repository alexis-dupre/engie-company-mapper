/**
 * Système de stockage pour les groupes
 */

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

const groups = new Map<string, Group>();
const comments = new Map<string, Comment[]>();

export const storage = {
  async getGroup(id: string): Promise<Group | null> {
    return groups.get(id) || null;
  },

  async getAllGroups(): Promise<Group[]> {
    return Array.from(groups.values());
  },

  async saveGroup(group: Group): Promise<void> {
    groups.set(group.id, { ...group, updatedAt: Date.now() });
  },

  async deleteGroup(id: string): Promise<void> {
    groups.delete(id);
    comments.delete(id);
  },

  async getComments(groupId: string): Promise<Comment[]> {
    return comments.get(groupId) || [];
  },

  async addComment(comment: Comment): Promise<void> {
    const groupComments = comments.get(comment.groupId) || [];
    groupComments.push(comment);
    comments.set(comment.groupId, groupComments);
  },

  async deleteComment(groupId: string, commentId: string): Promise<void> {
    const groupComments = comments.get(groupId) || [];
    comments.set(groupId, groupComments.filter(c => c.id !== commentId));
  },

  async updateComment(groupId: string, commentId: string, content: string): Promise<void> {
    const groupComments = comments.get(groupId) || [];
    const comment = groupComments.find(c => c.id === commentId);
    if (comment) {
      comment.content = content;
    }
  },
};
