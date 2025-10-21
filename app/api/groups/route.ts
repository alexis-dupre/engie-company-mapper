export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../lib/storage';

export async function GET() {
  console.log('[API] GET /api/groups (public)');
  try {
    const groups = await storage.getAllGroups();
    console.log('[API] Found', groups.length, 'groups');
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('[API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch groups'
    }, { status: 500 });
  }
}
