import type { CleanedLink } from "@/lib/sanitizer";

// ─── File Processor Interface (Strategy Pattern) ───
// Each file type gets its own processor that implements this interface.
// The factory/router picks the right processor based on file extension.
// This follows the Open/Closed principle — add new file types by creating
// a new processor class, not by modifying existing code.

export interface ExtractedLink {
  url: string;
  position: { start: number; end: number };
  context?: string;
}

export interface ProcessorResult {
  cleanedContent: Buffer;
  linksFound: number;
  linksCleaned: number;
  cleanedLinks: CleanedLink[];
  warning?: string;
}

export interface FileProcessor {
  /** Check if this processor handles the given file extension */
  canHandle(fileExtension: string): boolean;

  /**
   * Process a file buffer: extract URLs, sanitize them, rebuild the document.
   * The sanitize function is injected so processors don't depend on
   * the sanitizer implementation directly (Dependency Inversion).
   */
  process(
    buffer: Buffer,
    sanitize: (url: string) => CleanedLink
  ): Promise<ProcessorResult>;
}
