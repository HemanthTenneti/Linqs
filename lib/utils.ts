// ─── Shared Utility Functions ───

/**
 * Format a file size in bytes to a human-readable string.
 * Shows KB for files under 1MB, MB otherwise.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

/**
 * Get the file extension from a filename, lowercase.
 * Returns empty string if no extension found.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return "";
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Get the filename without extension.
 */
export function getFilenameWithoutExt(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.substring(0, lastDot);
}

/**
 * Calculate the expiry date for a file (7 days from now).
 */
export function calculateExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

/**
 * Generate the cleaned filename by appending "-linq-cleaned" before the extension.
 * Example: "report.docx" → "report-linq-cleaned.docx"
 */
export function generateCleanedFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  if (lastDot <= 0) return `${originalName}-linq-cleaned`;

  const nameWithoutExt = originalName.substring(0, lastDot);
  const extension = originalName.substring(lastDot);
  return `${nameWithoutExt}-linq-cleaned${extension}`;
}

/**
 * Merge class names conditionally.
 * Filters out falsy values and joins the rest with spaces.
 * This is a lightweight alternative to clsx that avoids an extra dependency.
 */
export function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(" ");
}

/**
 * Safely parse a string as a positive integer with a fallback.
 * Used for query parameter parsing in API routes.
 */
export function parsePositiveInt(
  value: string | null,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
}

/**
 * Create a standardized error response object.
 */
export function createErrorResponse(
  error: string,
  details?: string
): { success: false; error: string; details?: string } {
  return { success: false, error, details };
}

/**
 * Create a standardized success response object.
 */
export function createSuccessResponse<T extends Record<string, unknown>>(
  data: T
): { success: true } & T {
  return { success: true, ...data };
}
