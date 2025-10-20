/**
 * API Routes : Gestion d'un commentaire spécifique
 * PUT /api/admin/groups/[id]/comments/[commentId] - Mettre à jour un commentaire
 * DELETE /api/admin/groups/[id]/comments/[commentId] - Supprimer un commentaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateComment, deleteComment } from '@/lib/storage';

// Middleware d'authentification simplifié
function checkAuth(): boolean {
  const token = cookies().get('admin_session')?.value;
  return !!token; // Simple check: token exists
}

/**
 * PUT - Mettre à jour un commentaire
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    // Vérifier l'authentification
    if (!checkAuth()) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const commentId = params.commentId;
    const body = await request.json();
    const { comment } = body;

    // Validation
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'comment requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le commentaire
    const updatedComment = await updateComment(groupId, commentId, comment);

    if (!updatedComment) {
      return NextResponse.json(
        { success: false, error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedComment,
      message: 'Commentaire mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un commentaire
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    // Vérifier l'authentification
    if (!checkAuth()) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const commentId = params.commentId;

    // Supprimer le commentaire
    const success = await deleteComment(groupId, commentId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
