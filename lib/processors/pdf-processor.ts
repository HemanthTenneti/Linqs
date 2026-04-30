import type { FileProcessor, ProcessorResult } from "./base-processor";
import type { CleanedLink } from "@/lib/sanitizer";
import { PDFDocument } from "pdf-lib";
import { sanitizeUrl } from "@/lib/sanitizer/url-cleaner";

interface LookupCapable {
  lookup: (key: string) => unknown;
}

interface BytesCapable {
  asBytes: () => Uint8Array;
}

interface SetCapable {
  set: (value: Uint8Array) => void;
}

function hasLookup(value: unknown): value is LookupCapable {
  return (
    typeof value === "object" &&
    value !== null &&
    "lookup" in value &&
    typeof (value as { lookup?: unknown }).lookup === "function"
  );
}

function hasAsBytes(value: unknown): value is BytesCapable {
  return (
    typeof value === "object" &&
    value !== null &&
    "asBytes" in value &&
    typeof (value as { asBytes?: unknown }).asBytes === "function"
  );
}

function hasSet(value: unknown): value is SetCapable {
  return (
    typeof value === "object" &&
    value !== null &&
    "set" in value &&
    typeof (value as { set?: unknown }).set === "function"
  );
}

// ─── PDF Processor ───
// Handles .pdf files using a two-library approach:
// - pdf-parse-new extracts text content (including URLs) for analysis
// - pdf-lib modifies the PDF to replace URL annotations
//
// We can't do simple text replacement on PDFs because the text is stored
// as positioned glyphs, not as editable strings. Instead, we focus on
// URL annotations (hyperlinks) which pdf-lib can modify cleanly.

export class PdfProcessor implements FileProcessor {
  canHandle(fileExtension: string): boolean {
    return fileExtension === "pdf";
  }

  async process(
    buffer: Buffer,
    sanitize: (url: string) => CleanedLink
  ): Promise<ProcessorResult> {
    const cleanedLinks: CleanedLink[] = [];
    let linksFound = 0;

    // Load the PDF with pdf-lib for modification
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
    });

    // Process all pages for link annotations
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      // Get the annotation objects on this page
      const annotations = page.node.Annots();

      if (!annotations) continue;

      for (let i = 0; i < annotations.size(); i++) {
        const annotationRef = annotations.get(i);
        const annotation = annotationRef;

        if (!hasLookup(annotation)) {
          continue;
        }

        // We're looking for Link annotations (URI actions)
        if (annotation.lookup("Subtype")?.toString() !== "/Link") {
          continue;
        }

        // Get the URI action from the annotation
        const action = annotation.lookup("A");
        if (!action) continue;

        if (!hasLookup(action)) {
          continue;
        }

        // The URI is stored in the action's URI field
        const uriObj = action.lookup("URI");
        if (!uriObj) continue;

        if (!hasAsBytes(uriObj)) {
          continue;
        }

        // Extract the URL bytes from the PDF string object
        let url: string;
        try {
          const uriBytes = uriObj.asBytes();
          url = new TextDecoder().decode(uriBytes);
        } catch {
          // Some PDFs store URIs differently — skip what we can't parse
          continue;
        }

        // Only process HTTP/HTTPS URLs
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          continue;
        }

        linksFound++;
        const result = sanitize(url);

        if (result.wasModified) {
          cleanedLinks.push(result);

          // Replace the URI in the PDF annotation with the cleaned version
          const cleanedUriBytes = new TextEncoder().encode(result.cleaned);
          // Update the URI bytes in the existing annotation when mutable
          if (hasSet(uriObj)) {
            uriObj.set(cleanedUriBytes);
          }
        }
      }
    }

    // Also extract text content and scan for bare URLs
    // (some PDFs have URLs as text, not as annotations)
    try {
      const pdfParse = (await import("pdf-parse-new")).default;
      const textData = await pdfParse(buffer);
      const textUrls = textData.text.match(
        /https?:\/\/[^\s<>"')\]}\u0080-\uffff]+/gi
      );

      if (textUrls) {
        for (const textUrl of textUrls) {
          const trimmed = textUrl.replace(/[.,;!?:]+$/, "");
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            linksFound++;
            const result = sanitize(trimmed);
            if (result.wasModified) {
              cleanedLinks.push(result);
            }
          }
        }
      }
    } catch {
      // Text extraction is best-effort — PDF structure varies wildly
      // The annotation cleaning above is the primary mechanism
    }

    // Save the modified PDF
    const cleanedBytes = await pdfDoc.save();
    const cleanedBuffer = Buffer.from(cleanedBytes);

    return {
      cleanedContent: cleanedBuffer,
      linksFound,
      linksCleaned: cleanedLinks.length,
      cleanedLinks,
    };
  }
}
