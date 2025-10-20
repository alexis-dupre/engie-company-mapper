/**
 * Éditeur de commentaires pour une entreprise spécifique
 */

'use client';

import React, { useState } from 'react';
import { CompanyComment } from '@/types/group';

interface CommentEditorProps {
  groupId: string;
  companyAccountId: string;
  companyName: string;
  existingComment?: CompanyComment;
  onSave: (comment: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  groupId,
  companyAccountId,
  companyName,
  existingComment,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [comment, setComment] = useState(existingComment?.comment || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingComment;

  const handleSave = async () => {
    if (!comment.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = isEditing
        ? `/api/admin/groups/${groupId}/comments/${existingComment.id}`
        : `/api/admin/groups/${groupId}/comments`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyAccountId,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sauvegarde');
        setIsLoading(false);
        return;
      }

      onSave(comment);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingComment || !onDelete) return;

    if (!confirm('Supprimer ce commentaire ?')) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/admin/groups/${groupId}/comments/${existingComment.id}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la suppression');
        setIsLoading(false);
        return;
      }

      onDelete();
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 mb-1">
          {isEditing ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
        </h4>
        <p className="text-sm text-gray-600">
          Pour : <span className="font-medium">{companyName}</span>
        </p>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Saisissez votre commentaire..."
        disabled={isLoading}
      />

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Annuler
          </button>
        </div>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Affichage d'un commentaire existant en mode lecture
 */
interface CommentDisplayProps {
  comment: CompanyComment;
  onEdit?: () => void;
}

export const CommentDisplay: React.FC<CommentDisplayProps> = ({ comment, onEdit }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="ml-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Modifier
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500">
        {new Date(comment.updatedAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
};
