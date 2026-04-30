// ─── Application Constants ───
// Centralized configuration so magic numbers don't scatter through the codebase.
// All limits come directly from the architecture contract.

// File upload limits
export const MAX_FILES_PER_BATCH = 5;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_MB = 10;

// File retention
export const FILE_RETENTION_DAYS = 7;
export const FILE_RETENTION_MS = FILE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const PREIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// R2 bucket names
export const ORIGINALS_BUCKET = process.env.R2_ORIGINALS_BUCKET ?? "linkcleaner-originals";
export const CLEANED_BUCKET = process.env.R2_CLEANED_BUCKET ?? "linkcleaner-cleaned";

// Supported MIME types mapped to file extensions
// The values must match the fileType enum in the Mongoose schema
export const SUPPORTED_MIME_TYPES: Record<string, { extension: string; fileType: "docx" | "doc" | "pdf" | "md" | "txt" }> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
    fileType: "docx",
  },
  "application/msword": {
    extension: "doc",
    fileType: "doc",
  },
  "application/pdf": {
    extension: "pdf",
    fileType: "pdf",
  },
  "text/markdown": {
    extension: "md",
    fileType: "md",
  },
  "text/plain": {
    extension: "txt",
    fileType: "txt",
  },
};

// Reverse lookup: extension → MIME type
export const EXTENSION_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(SUPPORTED_MIME_TYPES).map(([mime, info]) => [
    info.extension,
    mime,
  ])
);

// File type to content type mapping for R2 uploads
export const FILE_TYPE_CONTENT_TYPE: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pdf: "application/pdf",
  md: "text/markdown",
  txt: "text/plain",
};

// The .doc format warning message — shown to users because
// legacy Word format can't guarantee formatting preservation
export const DOC_FORMAT_WARNING =
  "Formatting may not be fully preserved for .doc files. For best results, convert to .docx before uploading.";
