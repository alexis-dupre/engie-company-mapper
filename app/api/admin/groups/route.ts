export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { storage } from '../../../../lib/storage';

export async function GET() {
  try {
    const groups = await storage.getAllGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch groups'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json({
        success: false,
        error: 'Missing data'
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

    await storage.saveGroup(group);

    return NextResponse.json({ success: true, group });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create group'
    }, { status: 500 });
  }
}
