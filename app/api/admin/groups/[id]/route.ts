export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../../lib/storage';
import { isAuthenticated } from '../../../../../lib/auth';

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  if (!isAuthenticated(request)) {
    return NextResponse.json({
      success: false,
      error: 'Non autorisé'
    }, { status: 401 });
  }

  try {
    await storage.deleteGroup(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete group'
    }, { status: 500 });
  }
}
