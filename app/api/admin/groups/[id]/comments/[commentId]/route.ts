import { NextResponse } from 'next/server';
import { storage } from '../../../../../../../lib/storage';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await storage.deleteComment(params.id, params.commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete comment'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { content } = await request.json();
    await storage.updateComment(params.id, params.commentId, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update comment'
    }, { status: 500 });
  }
}
