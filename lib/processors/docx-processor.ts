import type { FileProcessor, ProcessorResult } from "./base-processor";
import type { CleanedLink } from "@/lib/sanitizer";

// ─── DOCX Processor (format-preserving) ───
// IMPORTANT: We do NOT convert DOCX -> HTML -> DOCX.
// That approach destroys styling/layout. Instead we edit the original DOCX ZIP
// in place and only change hyperlink targets / URL text where needed.

const URL_REGEX = /https?:\/\/[^\s<>"')\]}\u0080-\uffff]+/gi;

export class DocxProcessor implements FileProcessor {
  canHandle(fileExtension: string): boolean {
    return fileExtension === "docx";
  }

  async process(
    buffer: Buffer,
    sanitize: (url: string) => CleanedLink
  ): Promise<ProcessorResult> {
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(buffer);

    const cleanedLinks: CleanedLink[] = [];
    let linksFound = 0;

    // 1) Clean relationship targets (real clickable hyperlinks)
    //    Files: word/_rels/*.rels (document, headers, footers, etc.)
    const relationshipFiles = Object.keys(zip.files).filter(
      (name) =>
        name.startsWith("word/_rels/") && name.endsWith(".rels") && !zip.files[name].dir
    );

    for (const relPath of relationshipFiles) {
      const relFile = zip.files[relPath];
      if (!relFile) continue;

      const xml = await relFile.async("string");
      const updatedXml = xml.replace(
        /(<Relationship\b[^>]*\bType="[^"]*\/hyperlink"[^>]*\bTarget=")([^"]+)("[^>]*>)/gi,
        (_match, prefix: string, rawTarget: string, suffix: string) => {
          const target = decodeXml(rawTarget);

          if (!target.startsWith("http://") && !target.startsWith("https://")) {
            return `${prefix}${rawTarget}${suffix}`;
          }

          linksFound++;
          const result = sanitize(target);

          if (!result.wasModified) {
            return `${prefix}${rawTarget}${suffix}`;
          }

          cleanedLinks.push(result);
          return `${prefix}${encodeXml(result.cleaned)}${suffix}`;
        }
      );

      if (updatedXml !== xml) {
        zip.file(relPath, updatedXml);
      }
    }

    // 2) Best-effort cleanup for bare URLs stored in text nodes/fields
    //    Files: word/document.xml, headers, footers, footnotes, endnotes
    const textXmlFiles = Object.keys(zip.files).filter(
      (name) =>
        name.startsWith("word/") &&
        name.endsWith(".xml") &&
        !name.includes("_rels/") &&
        !zip.files[name].dir
    );

    for (const xmlPath of textXmlFiles) {
      const file = zip.files[xmlPath];
      if (!file) continue;

      const xml = await file.async("string");
      const updatedXml = replaceUrlsInXml(xml, sanitize, (result) => {
        linksFound++;
        if (result.wasModified) cleanedLinks.push(result);
      });

      if (updatedXml !== xml) {
        zip.file(xmlPath, updatedXml);
      }
    }

    // Rebuild as a compressed ZIP archive (.docx container) to avoid
    // large size inflation from STORE/no-compression output.
    const rebuilt = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    return {
      cleanedContent: Buffer.from(rebuilt),
      linksFound,
      linksCleaned: cleanedLinks.length,
      cleanedLinks,
    };
  }
}

function replaceUrlsInXml(
  xml: string,
  sanitize: (url: string) => CleanedLink,
  onSeen: (result: CleanedLink) => void
): string {
  return xml.replace(URL_REGEX, (match) => {
    const trailing = match.match(/([.,;!?:]+)$/);
    const rawUrl = trailing ? match.slice(0, -trailing[1].length) : match;
    const decodedUrl = decodeXml(rawUrl);

    const result = sanitize(decodedUrl);
    onSeen(result);

    if (!result.wasModified) {
      return match;
    }

    const encoded = encodeXml(result.cleaned);
    return trailing ? `${encoded}${trailing[1]}` : encoded;
  });
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function encodeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
