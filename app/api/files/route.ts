import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { CLEANED_BUCKET, PREIGNED_URL_EXPIRY_SECONDS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/utils";

// ─── GET /api/files ───
// Returns a paginated list of the current user's files, sorted newest first.
// Each file includes a presigned download URL so the frontend can offer
// immediate download without a separate round-trip.

interface FileItem {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  status: string;
  linksFound: number;
  linksCleaned: number;
  cleanedName?: string;
  downloadUrl?: string;
  createdAt: string;
  expiresAt: string;
}

interface FileListResponse {
  success: boolean;
  files: FileItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<FileListResponse>> {
  // ── Auth gate ──
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, files: [], pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, hasMore: false } },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // ── Parse pagination params ──
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE);
  const skip = (page - 1) * limit;

  // ── Query files ──
  await connectMongoose();

  const [files, total] = await Promise.all([
    FileModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FileModel.countDocuments({ userId }),
  ]);

  // ── Build response with presigned URLs ──
  // We generate URLs in parallel since each is an independent R2 API call
  const fileItems: FileItem[] = await Promise.all(
    files.map(async (file) => {
      let downloadUrl: string | undefined;

      // Only generate a download URL for completed files that have been cleaned
      if (file.status === "completed" && file.cleanedR2Key) {
        try {
          downloadUrl = await getPresignedDownloadUrl(
            CLEANED_BUCKET,
            file.cleanedR2Key,
            PREIGNED_URL_EXPIRY_SECONDS,
            file.cleanedName ?? file.originalName
          );
        } catch {
          // If presigned URL generation fails for one file, we still return
          // the rest of the data — the frontend can retry the download later.
          downloadUrl = undefined;
        }
      }

      return {
        id: file._id.toString(),
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        status: file.status,
        linksFound: file.linksFound,
        linksCleaned: file.linksCleaned,
        cleanedName: file.cleanedName,
        downloadUrl,
        createdAt: file.createdAt?.toISOString() ?? new Date().toISOString(),
        expiresAt: file.expiresAt?.toISOString() ?? new Date().toISOString(),
      };
    })
  );

  return NextResponse.json({
    success: true,
    files: fileItems,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + files.length < total,
    },
  });
}
