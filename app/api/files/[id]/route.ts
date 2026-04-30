import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { deleteFromR2 } from "@/lib/r2";
import { ORIGINALS_BUCKET, CLEANED_BUCKET } from "@/lib/constants";

// ─── DELETE /api/files/[id] ───
// Permanently deletes a file: removes both the original and cleaned versions
// from R2 storage, then removes the MongoDB document. The user must own the
// file — attempting to delete another user's file returns 403.

interface DeleteResponse {
  success: boolean;
  error?: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteResponse>> {
  // ── Auth gate ──
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // ── Resolve route params ──
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "File ID is required" },
      { status: 400 }
    );
  }

  // ── Find the file ──
  await connectMongoose();

  const file = await FileModel.findById(id);
  if (!file) {
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }

  // ── Ownership check ──
  // file.userId is an ObjectId, so we compare string representations
  if (file.userId.toString() !== userId) {
    return NextResponse.json(
      { success: false, error: "Access denied" },
      { status: 403 }
    );
  }

  // ── Delete from R2 ──
  // With content-cache dedupe enabled, multiple file records can reference the
  // same R2 object. Only delete the object when this is the last active reference.
  const r2Errors: string[] = [];
  const hasOtherOriginalRef = await FileModel.exists({
    _id: { $ne: id },
    originalR2Key: file.originalR2Key,
    purgedAt: null,
  });

  if (!hasOtherOriginalRef) {
    try {
      await deleteFromR2(ORIGINALS_BUCKET, file.originalR2Key);
    } catch {
      r2Errors.push("Failed to delete original from storage");
    }
  }

  if (file.cleanedR2Key) {
    const hasOtherCleanedRef = await FileModel.exists({
      _id: { $ne: id },
      cleanedR2Key: file.cleanedR2Key,
      purgedAt: null,
    });

    if (!hasOtherCleanedRef) {
      try {
        await deleteFromR2(CLEANED_BUCKET, file.cleanedR2Key);
      } catch {
        r2Errors.push("Failed to delete cleaned file from storage");
      }
    }
  }

  // ── Delete from MongoDB ──
  await FileModel.deleteOne({ _id: id });

  // If R2 deletions failed, we still report partial success since the DB
  // record is gone and the orphaned R2 objects will be cleaned up by the
  // cron job within 7 days.
  if (r2Errors.length > 0) {
    return NextResponse.json({
      success: true,
      error: `File deleted from database. Storage cleanup had issues: ${r2Errors.join("; ")}`,
    });
  }

  return NextResponse.json({ success: true });
}
