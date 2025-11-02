export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../../lib/storage';

/**
 * GET /api/groups/[id]/tags
 * Route publique pour récupérer les tags d'un groupe (lecture seule)
 * Accessible à tous les visiteurs sans authentification
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tags = await storage.getGroupTags(params.id);
    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error('[Public Tags API] Error loading tags:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
