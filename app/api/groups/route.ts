/**
 * API publique - Liste des groupes publics
 * GET /api/groups
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllGroupsMetadata, initStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    await initStorage();
    const groups = await getAllGroupsMetadata(true); // true = publics uniquement

    return NextResponse.json({
      success: true,
      data: groups,
      total: groups.length,
    });
  } catch (error) {
    console.error('Error getting public groups:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
