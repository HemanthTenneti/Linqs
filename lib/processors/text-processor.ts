import type { FileProcessor, ProcessorResult } from "./base-processor";
import type { CleanedLink } from "@/lib/sanitizer";
import { extractUrlsFromText, replaceUrlsInText } from "@/lib/sanitizer/url-cleaner";

// ─── Text Processor ───
// Handles both .md (Markdown) and .txt (plain text) files.
// These are the simplest formats — just find URLs in the text
// and replace them with cleaned versions using regex.
//
// Both formats store content as raw UTF-8 text, so we can do
// direct string replacement without any format parsing.

export class TextProcessor implements FileProcessor {
  private readonly supportedExtensions: Set<string>;

  constructor() {
    this.supportedExtensions = new Set(["md", "txt"]);
  }

  canHandle(fileExtension: string): boolean {
    return this.supportedExtensions.has(fileExtension);
  }

  async process(
    buffer: Buffer,
    sanitize: (url: string) => CleanedLink
  ): Promise<ProcessorResult> {
    const text = buffer.toString("utf-8");

    // Find all HTTP/HTTPS URLs in the text
    const foundUrls = extractUrlsFromText(text);

    // Replace URLs with cleaned versions, collecting metadata
    const { cleanedText, cleanedLinks } = replaceUrlsInText(text, sanitize);

    return {
      cleanedContent: Buffer.from(cleanedText, "utf-8"),
      linksFound: foundUrls.length,
      linksCleaned: cleanedLinks.length,
      cleanedLinks,
    };
  }
}
