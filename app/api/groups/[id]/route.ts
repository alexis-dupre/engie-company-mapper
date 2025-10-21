export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] GET /api/groups/' + params.id);
    const group = await storage.getGroup(params.id);

    if (!group) {
      console.log('[API] Group not found:', params.id);
      return NextResponse.json({
        success: false,
        error: 'Group not found'
      }, { status: 404 });
    }

    console.log('[API] Group found:', group.name);
    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}
