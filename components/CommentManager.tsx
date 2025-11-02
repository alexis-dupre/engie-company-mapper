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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                💬 Commentaires
              </h2>
              <p className="text-sm text-gray-600 mt-1">{companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Liste des commentaires existants */}
          {currentComments.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Commentaires existants</h3>
              {currentComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-500">
                      {comment.author && (
                        <span className="font-medium text-gray-700">
                          {comment.author} •{' '}
                        </span>
                      )}
                      {formatDate(comment.createdAt)}
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <p className="text-gray-500">Aucun commentaire pour cette entreprise</p>
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ajouter un commentaire</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auteur (optionnel)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Votre nom..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire *
                </label>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Saisissez votre commentaire..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isLoading}
            >
              Fermer
            </button>
            <button
              onClick={handleAddComment}
              disabled={isLoading || !newCommentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ajout...' : 'Ajouter le commentaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
