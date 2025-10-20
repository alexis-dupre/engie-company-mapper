/**
 * API Routes : Gestion des commentaires sur les entreprises d'un groupe
 * POST /api/admin/groups/[id]/comments - Créer un commentaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addComment } from '@/lib/storage';

// Middleware d'authentification simplifié
function checkAuth(): boolean {
  const token = cookies().get('admin_session')?.value;
  return !!token; // Simple check: token exists
}

/**
 * POST - Créer un nouveau commentaire
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const body = await request.json();
    const { companyAccountId, comment } = body;

    // Validation
    if (!companyAccountId || !comment) {
      return NextResponse.json(
        { success: false, error: 'companyAccountId et comment requis' },
        { status: 400 }
      );
    }

    // Créer le commentaire
    const newComment = await addComment(groupId, companyAccountId, comment);

    return NextResponse.json({
      success: true,
      data: newComment,
      message: 'Commentaire ajouté avec succès',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
