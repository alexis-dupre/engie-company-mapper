/**
 * API publique - Détails d'un groupe public
 * GET /api/groups/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGroupById } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const group = await getGroupById(params.id);

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le groupe est public
    if (!group.metadata.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Groupe non accessible' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { group },
    });
  } catch (error) {
    console.error('Error getting group:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
