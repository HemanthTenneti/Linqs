import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { getPresignedDownloadUrl, uploadToR2 } from "@/lib/r2";
import { CLEANED_BUCKET, PREIGNED_URL_EXPIRY_SECONDS } from "@/lib/constants";
import JSZip from "jszip";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "@/lib/r2";

// ─── POST /api/files/download-zip ───
// Bundles multiple cleaned files into a single ZIP archive. The user selects
// files on the frontend, we verify they all belong to the current user,
// download each cleaned file from R2, pack them into a ZIP using JSZip,
// upload the ZIP back to R2, and return a presigned URL for download.
// This avoids streaming large payloads through the Next.js server.

interface ZipDownloadResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ZipDownloadResponse>> {
  // ── Auth gate ──
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // ── Parse request body ──
  let body: { fileIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { fileIds } = body;

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return NextResponse.json(
      { success: false, error: "fileIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // ── Connect and find files ──
  await connectMongoose();

  const files = await FileModel.find({
    _id: { $in: fileIds },
    userId,
    status: "completed",
    cleanedR2Key: { $exists: true, $ne: null },
  });

  // ── Verify all requested files were found and belong to the user ──
  if (files.length !== fileIds.length) {
    // Some files weren't found, don't belong to the user, or aren't completed
    const foundIds = new Set(files.map((f) => f._id.toString()));
    const missingOrUnauthorized = fileIds.filter((id) => !foundIds.has(id));
    return NextResponse.json(
      {
        success: false,
        error: `Some files are not available: ${missingOrUnauthorized.join(", ")}`,
      },
      { status: 403 }
    );
  }

  // ── Download cleaned files from R2 and add to ZIP ──
  const zip = new JSZip();

  for (const file of files) {
    try {
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: CLEANED_BUCKET,
          Key: file.cleanedR2Key!,
        })
      );

      if (!response.Body) {
        continue;
      }

      // Convert the stream to a buffer for JSZip
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);

      // Use the cleaned filename inside the ZIP so users get readable names
      // If multiple files have the same name, JSZip will overwrite — but
      // that's unlikely since each batch has unique filenames
      zip.file(file.cleanedName ?? file.originalName, buffer);
    } catch {
      // Skip files that fail to download rather than failing the whole batch
      continue;
    }
  }

  // ── Generate the ZIP buffer ──
  let zipBuffer: Buffer;
  try {
    const zipOutput = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
    zipBuffer = Buffer.from(zipOutput);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create ZIP archive" },
      { status: 500 }
    );
  }

  // ── Upload ZIP to R2 ──
  const zipKey = `${userId}/zips/${Date.now()}-cleaned-files.zip`;
  try {
    await uploadToR2(CLEANED_BUCKET, zipKey, zipBuffer, "application/zip");
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to upload ZIP archive" },
      { status: 500 }
    );
  }

  // ── Generate presigned download URL ──
  try {
    const presignedUrl = await getPresignedDownloadUrl(
      CLEANED_BUCKET,
      zipKey,
      PREIGNED_URL_EXPIRY_SECONDS,
      "linq-cleaned-files.zip"
    );

    return NextResponse.json({
      success: true,
      downloadUrl: presignedUrl,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
