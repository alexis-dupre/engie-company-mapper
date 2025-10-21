export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../lib/storage';

export async function GET() {
  console.log('[API] GET /api/admin/groups');
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

export async function POST(request: Request) {
  console.log('[API] POST /api/admin/groups - START');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    console.log('[API] File:', file?.name, 'Name:', name);

    if (!file || !name) {
      return NextResponse.json({
        success: false,
        error: 'Missing file or name'
      }, { status: 400 });
    }

    const text = await file.text();
    const data = JSON.parse(text);

    const group = {
      id: Date.now().toString(),
      name,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    console.log('[API] Saving group:', group.id);
    await storage.saveGroup(group);
    console.log('[API] Group saved successfully');

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error('[API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create group',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
