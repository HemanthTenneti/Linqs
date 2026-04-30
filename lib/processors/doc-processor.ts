import type { FileProcessor, ProcessorResult } from "./base-processor";
import type { CleanedLink } from "@/lib/sanitizer";
import { extractUrlsFromText, replaceUrlsInText } from "@/lib/sanitizer/url-cleaner";
import { DOC_FORMAT_WARNING } from "@/lib/constants";

// ─── DOC Processor ───
// Handles legacy .doc files using word-extractor.
// This is a best-effort processor — the .doc binary format is complex
// and word-extractor can extract text but formatting is not guaranteed.
// We set the warning flag so the UI can inform the user.

export class DocProcessor implements FileProcessor {
  canHandle(fileExtension: string): boolean {
    return fileExtension === "doc";
  }

  async process(
    buffer: Buffer,
    sanitize: (url: string) => CleanedLink
  ): Promise<ProcessorResult> {
    // word-extractor reads the legacy .doc binary format and returns plain text
    const WordExtractor = (await import("word-extractor")).default;
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(buffer);
    const text = extracted.getBody();

    // Extract URLs from the plain text output
    const foundUrls = extractUrlsFromText(text);

    // Replace URLs in the text with cleaned versions
    const { cleanedText, cleanedLinks } = replaceUrlsInText(text, sanitize);

    return {
      cleanedContent: Buffer.from(cleanedText, "utf-8"),
      linksFound: foundUrls.length,
      linksCleaned: cleanedLinks.length,
      cleanedLinks,
      // Always warn for .doc files — formatting preservation is not possible
      warning: DOC_FORMAT_WARNING,
    };
  }
}
