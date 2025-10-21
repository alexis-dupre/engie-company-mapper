export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../../../lib/storage';
import { isAuthenticated } from '../../../../../../lib/auth';
import type { CustomTag } from '../../../../../../types/company';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const tags = await storage.getGroupTags(params.id);
    return NextResponse.json({ success: true, tags });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { companyId, tag } = await request.json() as {
      companyId: string;
      tag: CustomTag;
    };

    if (!companyId || !tag || !tag.type) {
      return NextResponse.json({
        success: false,
        error: 'Missing data'
      }, { status: 400 });
    }

    await storage.addTagToCompany(params.id, companyId, tag);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding tag:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { companyId, tagType } = await request.json();

    if (!companyId || !tagType) {
      return NextResponse.json({
        success: false,
        error: 'Missing data'
      }, { status: 400 });
    }

    await storage.removeTagFromCompany(params.id, companyId, tagType);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
