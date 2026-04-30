import type { FileProcessor, ProcessorResult } from "./base-processor";
import type { CleanedLink } from "@/lib/sanitizer";
import { DocxProcessor } from "./docx-processor";
import { DocProcessor } from "./doc-processor";
import { PdfProcessor } from "./pdf-processor";
import { TextProcessor } from "./text-processor";

// ─── Processor Factory / Router ───
// Implements the Strategy pattern: picks the right processor for a file type
// and delegates the work. New file types are added by creating a processor
// and registering it here — no other code changes needed.

class UnsupportedFileTypeError extends Error {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`);
    this.name = "UnsupportedFileTypeError";
  }
}

// Registry of all available processors
// Order doesn't matter since each processor checks canHandle() with an exact match
const processors: FileProcessor[] = [
  new DocxProcessor(),
  new DocProcessor(),
  new PdfProcessor(),
  new TextProcessor(),
];

/**
 * Find the right processor for a given file extension.
 * Throws if no processor supports the extension.
 */
function getProcessor(fileExtension: string): FileProcessor {
  const processor = processors.find((p) => p.canHandle(fileExtension));
  if (!processor) {
    throw new UnsupportedFileTypeError(fileExtension);
  }
  return processor;
}

/**
 * Process a file through the appropriate processor.
 * This is the main entry point that API routes call.
 */
export async function processFile(
  buffer: Buffer,
  fileExtension: string,
  sanitize: (url: string) => CleanedLink
): Promise<ProcessorResult> {
  const processor = getProcessor(fileExtension);
  return processor.process(buffer, sanitize);
}

/**
 * Check if a file extension is supported by any processor.
 */
export function isSupportedFileType(fileExtension: string): boolean {
  return processors.some((p) => p.canHandle(fileExtension));
}

export { UnsupportedFileTypeError };
