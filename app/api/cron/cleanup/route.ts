import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { BatchModel } from "@/lib/models/batch";
import { deleteFromR2 } from "@/lib/r2";
import { ORIGINALS_BUCKET, CLEANED_BUCKET } from "@/lib/constants";

// ─── GET /api/cron/cleanup ───
// Called by a scheduled cron job (e.g. Vercel Cron or Cloudflare Workers Cron).
// Finds all expired files that haven't been purged yet, deletes their R2 objects
// to free storage, and marks them as purged in the database. Also cleans up
// completed batches. Protected by a shared CRON_SECRET to prevent abuse.

interface CleanupResponse {
  success: boolean;
  purgedFiles: number;
  purgedBatches: number;
  errors: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse<CleanupResponse>> {
  // ── Verify cron secret ──
  // The Authorization header must match our shared secret.
  // This prevents anyone from hitting the endpoint and triggering mass deletions.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        success: false,
        purgedFiles: 0,
        purgedBatches: 0,
        errors: ["Unauthorized"],
      },
      { status: 401 }
    );
  }

  // ── Connect to MongoDB ──
  await connectMongoose();

  const errors: string[] = [];
  let purgedFiles = 0;
  let purgedBatches = 0;
  const now = new Date();

  // ── Purge expired files ──
  // Find all File documents where the retention period has passed
  // and haven't been purged yet. We process them one at a time
  // to handle R2 errors gracefully per-file.
  const expiredFiles = await FileModel.find({
    expiresAt: { $lt: now },
    purgedAt: null,
  });

  for (const file of expiredFiles) {
    try {
      // Delete original from R2
      try {
        await deleteFromR2(ORIGINALS_BUCKET, file.originalR2Key);
      } catch {
        errors.push(`Failed to delete original R2 object for file ${file._id}`);
      }

      // Delete cleaned version from R2 (may not exist for failed files)
      if (file.cleanedR2Key) {
        try {
          await deleteFromR2(CLEANED_BUCKET, file.cleanedR2Key);
        } catch {
          errors.push(`Failed to delete cleaned R2 object for file ${file._id}`);
        }
      }

      // Mark as purged so we don't retry on the next cron run
      file.purgedAt = now;
      await file.save();
      purgedFiles++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to purge file ${file._id}: ${message}`);
    }
  }

  // ── Clean up completed batches ──
  // Batches are organizational containers — once all their files are purged
  // or completed, we can remove them to keep the database lean.
  const completedBatches = await BatchModel.find({
    status: { $in: ["completed", "partial", "failed"] },
    expiresAt: { $lt: now },
  });

  for (const batch of completedBatches) {
    try {
      await BatchModel.deleteOne({ _id: batch._id });
      purgedBatches++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to delete batch ${batch._id}: ${message}`);
    }
  }

  return NextResponse.json({
    success: true,
    purgedFiles,
    purgedBatches,
    errors,
  });
}
