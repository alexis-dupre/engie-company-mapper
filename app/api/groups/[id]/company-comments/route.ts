export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../../lib/storage';
import { isAuthenticated } from '../../../../../lib/auth';
import type { Comment } from '../../../../../types/company';

// GET - Accessible à tous (visiteurs et admins)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await storage.getCompanyComments(params.id);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error getting company comments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comments'
    }, { status: 500 });
  }
}

// POST - Admin seulement
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({
      success: false,
      error: 'Non autorisé'
    }, { status: 401 });
  }

  try {
    const { companyId, text, author } = await request.json();

    if (!companyId || !text) {
      return NextResponse.json({
        success: false,
        error: 'Missing data'
      }, { status: 400 });
    }

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      createdAt: Date.now(),
      author: author || 'Admin',
    };

    await storage.addCommentToCompany(params.id, companyId, comment);

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add comment'
    }, { status: 500 });
  }
}

// DELETE - Admin seulement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({
      success: false,
      error: 'Non autorisé'
    }, { status: 401 });
  }

  try {
    const { companyId, commentId } = await request.json();

    if (!companyId || !commentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing data'
      }, { status: 400 });
    }

    await storage.deleteCommentFromCompany(params.id, companyId, commentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete comment'
    }, { status: 500 });
  }
}
