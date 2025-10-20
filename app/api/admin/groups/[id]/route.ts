/**
 * API Routes : Gestion d'un groupe spécifique
 * GET /api/admin/groups/[id] - Récupérer un groupe
 * PUT /api/admin/groups/[id] - Mettre à jour un groupe
 * DELETE /api/admin/groups/[id] - Supprimer un groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';
import {
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupComments,
} from '@/lib/storage';
import { GroupTag, DiliTrustModule } from '@/types/group';

// Middleware d'authentification
function checkAuth(): boolean {
  const token = cookies().get('admin_session')?.value;
  return isAuthenticated(token);
}

/**
 * GET - Récupérer un groupe avec ses commentaires
 */
export async function GET(
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

    // Récupérer le groupe
    const group = await getGroupById(groupId);

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les commentaires
    const comments = await getGroupComments(groupId);

    return NextResponse.json({
      success: true,
      data: {
        group,
        comments,
      },
    });
  } catch (error) {
    console.error('Error getting group:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Mettre à jour un groupe
 */
export async function PUT(
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
    const {
      name,
      description,
      tags,
      dilitrustModules,
      comments,
      isPublic,
    } = body;

    // Validation des modules DiliTrust si le tag est présent
    if (tags && tags.includes('CLIENT_DILITRUST')) {
      if (!dilitrustModules || dilitrustModules.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Modules DiliTrust requis pour les clients DiliTrust' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le groupe
    const updatedGroup = await updateGroup(groupId, {
      name,
      description,
      tags: tags as GroupTag[],
      dilitrustModules: dilitrustModules as DiliTrustModule[],
      comments,
      isPublic,
    });

    if (!updatedGroup) {
      return NextResponse.json(
        { success: false, error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Groupe mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un groupe
 */
export async function DELETE(
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

    // Supprimer le groupe
    const success = await deleteGroup(groupId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Groupe supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
