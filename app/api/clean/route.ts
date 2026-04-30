import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { FileModel } from "@/lib/models/file";
import { BatchModel } from "@/lib/models/batch";
import { processFile } from "@/lib/processors";
import { sanitizeUrl } from "@/lib/sanitizer";
import {
  uploadToR2,
  getPresignedDownloadUrl,
  generateR2Key,
  generateCleanedR2Key,
} from "@/lib/r2";
import {
  MAX_FILES_PER_BATCH,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_MIME_TYPES,
  ORIGINALS_BUCKET,
  CLEANED_BUCKET,
  PREIGNED_URL_EXPIRY_SECONDS,
  FILE_TYPE_CONTENT_TYPE,
} from "@/lib/constants";
import { calculateExpiryDate, generateCleanedFilename } from "@/lib/utils";

// ─── POST /api/clean ───
// The main workhorse: accepts uploaded files, processes each one to strip
// tracking parameters from URLs, uploads cleaned versions to R2, and returns
// a batch result. This is the endpoint the frontend hits after file selection.

interface CleanedFileResult {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  linksFound: number;
  linksCleaned: number;
  cleanedDownloadUrl: string;
  warning?: string;
  error?: string;
}

interface CleanResponse {
  success: boolean;
  batchId: string;
  totalFiles: number;
  files: CleanedFileResult[];
}

export async function POST(request: NextRequest): Promise<NextResponse<CleanResponse>> {
  // ── Auth gate ──
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, batchId: "", totalFiles: 0, files: [] },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // ── Parse FormData ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        success: false,
        batchId: "",
        totalFiles: 0,
        files: [],
      },
      { status: 400 }
    );
  }

  const files = formData.getAll("files");
  if (!files || files.length === 0) {
    return NextResponse.json(
      {
        success: false,
        batchId: "",
        totalFiles: 0,
        files: [],
      },
      { status: 400 }
    );
  }

  // ── Validate file count ──
  if (files.length > MAX_FILES_PER_BATCH) {
    return NextResponse.json(
      {
        success: false,
        batchId: "",
        totalFiles: 0,
        files: [],
      },
      { status: 400 }
    );
  }

  // ── Validate each file ──
  const validFiles: File[] = [];
  for (const fileEntry of files) {
    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          batchId: "",
          totalFiles: 0,
          files: [],
        },
        { status: 400 }
      );
    }

    const file = fileEntry as File;

    // Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          batchId: "",
          totalFiles: 0,
          files: [],
        },
        { status: 400 }
      );
    }

    // MIME type check
    const mimeInfo = SUPPORTED_MIME_TYPES[file.type];
    if (!mimeInfo) {
      return NextResponse.json(
        {
          success: false,
          batchId: "",
          totalFiles: 0,
          files: [],
        },
        { status: 400 }
      );
    }

    validFiles.push(file);
  }

  // ── Connect to MongoDB ──
  await connectMongoose();

  // ── Create Batch document ──
  const expiresAt = calculateExpiryDate();
  const batch = await BatchModel.create({
    userId,
    totalFiles: validFiles.length,
    status: "processing",
    expiresAt,
  });

  const batchId = batch._id.toString();
  const results: CleanedFileResult[] = [];

  // ── Process each file ──
  for (const file of validFiles) {
    const mimeInfo = SUPPORTED_MIME_TYPES[file.type];
    const { extension, fileType } = mimeInfo;
    const originalName = file.name || `upload.${extension}`;

    try {
      // Read file into buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate unique R2 key for the original
      // We use a temp ID placeholder and will update after doc creation
      const tempId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const originalR2Key = generateR2Key(userId, batchId, tempId, originalName);

      // Upload original to R2
      await uploadToR2(ORIGINALS_BUCKET, originalR2Key, buffer, file.type);

      // Create the File document — status starts as "processing"
      const fileDoc = await FileModel.create({
        userId,
        batchId,
        originalName,
        fileType,
        fileSize: buffer.length,
        originalR2Key,
        status: "processing",
        linksFound: 0,
        linksCleaned: 0,
        expiresAt,
      });

      const fileId = fileDoc._id.toString();

      // Re-upload original with the real fileId in the key
      // This ensures the R2 key matches our convention: {userId}/{batchId}/{fileId}_{filename}
      const finalOriginalKey = generateR2Key(userId, batchId, fileId, originalName);
      await uploadToR2(ORIGINALS_BUCKET, finalOriginalKey, buffer, file.type);

      // Process the file through the appropriate processor
      const processorResult = await processFile(buffer, extension, sanitizeUrl);

      // Generate cleaned R2 key and upload
      const cleanedR2Key = generateCleanedR2Key(userId, batchId, fileId, originalName);
      const cleanedContentType = FILE_TYPE_CONTENT_TYPE[fileType] ?? "application/octet-stream";
      await uploadToR2(CLEANED_BUCKET, cleanedR2Key, processorResult.cleanedContent, cleanedContentType);

      // Generate the cleaned filename
      const cleanedName = generateCleanedFilename(originalName);

      // Generate a presigned download URL for the cleaned file
      const cleanedDownloadUrl = await getPresignedDownloadUrl(
        CLEANED_BUCKET,
        cleanedR2Key,
        PREIGNED_URL_EXPIRY_SECONDS,
        cleanedName
      );

      // Update the file document with results
      await FileModel.updateOne(
        { _id: fileId },
        {
          $set: {
            originalR2Key: finalOriginalKey,
            status: "completed",
            cleanedR2Key,
            cleanedName,
            linksFound: processorResult.linksFound,
            linksCleaned: processorResult.linksCleaned,
            cleanedLinks: processorResult.cleanedLinks.map((link) => ({
              original: link.original,
              cleaned: link.cleaned,
              removedParams: link.removedParams,
            })),
          },
        }
      );

      results.push({
        id: fileId,
        originalName,
        fileType,
        fileSize: buffer.length,
        linksFound: processorResult.linksFound,
        linksCleaned: processorResult.linksCleaned,
        cleanedDownloadUrl,
        warning: processorResult.warning,
      });
    } catch (error) {
      // Individual file failure shouldn't abort the whole batch —
      // we mark it as failed and continue processing remaining files.
      // The batch status will be set to "partial" if any file fails.
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";

      results.push({
        id: "",
        originalName,
        fileType,
        fileSize: file.size,
        linksFound: 0,
        linksCleaned: 0,
        cleanedDownloadUrl: "",
        error: errorMessage,
      });
    }
  }

  // ── Determine batch status ──
  const completedCount = results.filter((r) => !r.error).length;
  const failedCount = results.filter((r) => r.error).length;

  let batchStatus: "completed" | "partial" | "failed";
  if (failedCount === 0) {
    batchStatus = "completed";
  } else if (completedCount === 0) {
    batchStatus = "failed";
  } else {
    batchStatus = "partial";
  }

  await BatchModel.updateOne({ _id: batch._id }, { status: batchStatus });

  return NextResponse.json(
    {
      success: batchStatus !== "failed",
      batchId,
      totalFiles: validFiles.length,
      files: results,
    },
    { status: batchStatus === "failed" ? 500 : 200 }
  );
}
