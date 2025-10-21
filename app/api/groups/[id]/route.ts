export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const group = await storage.getGroup(params.id);

    if (!group) {
      return NextResponse.json({
        success: false,
        error: 'Group not found'
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, group });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch group'
    }, { status: 500 });
  }
}
