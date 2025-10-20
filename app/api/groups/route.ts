import { NextResponse } from 'next/server';
import { storage } from '../../../lib/storage';

export async function GET() {
  try {
    const groups = await storage.getAllGroups();
    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch groups'
    }, { status: 500 });
  }
}
