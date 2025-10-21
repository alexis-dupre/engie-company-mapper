export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { storage } from '../../../../../../lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await storage.getComments(params.id);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comments'
    }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content, author } = await request.json();

    const comment = {
      id: Date.now().toString(),
      groupId: params.id,
      content,
      author,
      createdAt: Date.now(),
    };

    await storage.addComment(comment);

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to add comment'
    }, { status: 500 });
  }
}
