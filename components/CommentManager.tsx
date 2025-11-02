/**
 * CommentManager Modal - Redesigned with Notion/Shadcn aesthetic
 */

import { useState } from 'react';
import type { Comment } from '../types/company';

interface CommentManagerProps {
  companyId: string;
  companyName: string;
  currentComments: Comment[];
  onClose: () => void;
  onSave: (text: string, author?: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentManager({
  companyId,
  companyName,
  currentComments,
  onClose,
  onSave,
  onDelete
}: CommentManagerProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    setIsLoading(true);
    try {
      await onSave(newCommentText, author || undefined);
      setNewCommentText('');
      setAuthor('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    setIsLoading(true);
    try {
      await onDelete(commentId);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gérer les commentaires</h2>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-260px)]">
          {/* Commentaires existants */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Commentaires <span className="text-muted-foreground font-normal">({currentComments.length})</span>
            </h3>
            {currentComments.length > 0 ? (
              <div className="space-y-3">
                {currentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="group bg-muted border border-border rounded-lg p-4"
                  >
                    {/* Header du commentaire */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          {comment.author && (
                            <div className="font-medium text-foreground text-sm">
                              {comment.author}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {/* Corps du commentaire */}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg border border-border">
                <svg className="w-10 h-10 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment</p>
              </div>
            )}
          </div>

          {/* Formulaire d'ajout */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Ajouter un commentaire</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Auteur (optionnel)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Votre nom..."
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Commentaire <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Saisissez votre commentaire..."
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {newCommentText.length} caractère{newCommentText.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 font-medium text-sm transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleAddComment}
              disabled={isLoading || !newCommentText.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ajout...
                </span>
              ) : (
                'Ajouter le commentaire'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
