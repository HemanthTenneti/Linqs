import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { CLEANED_BUCKET, PREIGNED_URL_EXPIRY_SECONDS } from "@/lib/constants";

// ─── GET /api/files/[id]/download ───
// Generates a presigned URL for the cleaned version of a file and redirects
// the client there. The presigned URL grants temporary access (1 hour)
// without exposing R2 credentials to the browser.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
  if (file.userId.toString() !== userId) {
    return NextResponse.json(
      { success: false, error: "Access denied" },
      { status: 403 }
    );
  }

  // ── Verify file is ready for download ──
  if (file.status !== "completed") {
    return NextResponse.json(
      { success: false, error: "File is not ready for download" },
      { status: 400 }
    );
  }

  if (!file.cleanedR2Key) {
    return NextResponse.json(
      { success: false, error: "Cleaned file not available" },
      { status: 404 }
    );
  }

  // ── Generate presigned URL and redirect ──
  try {
    const presignedUrl = await getPresignedDownloadUrl(
      CLEANED_BUCKET,
      file.cleanedR2Key,
      PREIGNED_URL_EXPIRY_SECONDS
    );

    // 302 redirect sends the browser directly to the R2 presigned URL
    // so we don't have to stream the file through our server
    return NextResponse.redirect(presignedUrl);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
