import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── R2 Client ───
// Cloudflare R2 uses the S3-compatible API, so we configure
// the standard AWS S3Client with R2's endpoint URL
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export default r2;

// ─── Helper Functions ───
// These encapsulate the S3 SDK calls so the rest of the codebase
// doesn't need to know about S3 command objects

/**
 * Upload a file buffer to an R2 bucket.
 * Returns the R2 object key for storage in MongoDB.
 */
export async function uploadToR2(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Generate a presigned download URL that grants temporary access
 * without exposing R2 credentials to the client.
 */
export async function getPresignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600 // 1 hour default — matches contract spec
): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

/**
 * Delete a single object from R2.
 * Used during cron cleanup to free storage after the 7-day TTL.
 */
export async function deleteFromR2(
  bucket: string,
  key: string
): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Build the R2 key path following the bucket layout convention:
 * {userId}/{batchId}/{fileId}_{filename}
 * This keeps files organized by user and batch for easy cleanup.
 */
export function generateR2Key(
  userId: string,
  batchId: string,
  fileId: string,
  filename: string
): string {
  return `${userId}/${batchId}/${fileId}_${filename}`;
}

/**
 * Build the R2 key for a cleaned file — appends "_cleaned" before extension.
 * Example: "report.docx" → "report_cleaned.docx"
 */
export function generateCleanedR2Key(
  userId: string,
  batchId: string,
  fileId: string,
  originalName: string
): string {
  const lastDotIndex = originalName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  const extension =
    lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";
  const cleanedName = `${nameWithoutExt}_cleaned${extension}`;

  return `${userId}/${batchId}/${fileId}_${cleanedName}`;
}
