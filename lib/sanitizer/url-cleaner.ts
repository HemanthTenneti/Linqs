import { isTrackingParam } from "./tracking-params";

// ─── URL Cleaner ───
// The core sanitization engine. Takes a raw URL, identifies and removes
// all tracking query parameters, and returns a clean URL with metadata
// about what was stripped.

export interface CleanedLink {
  original: string;
  cleaned: string;
  removedParams: string[];
  wasModified: boolean;
}

/**
 * Sanitize a URL by removing all tracking query parameters.
 *
 * Rules (from contract):
 * 1. Parse URL with the URL constructor
 * 2. Iterate all searchParams
 * 3. Remove params matching blocklist or prefix patterns
 * 4. Preserve hash/fragment unchanged
 * 5. If nothing removed, wasModified = false
 * 6. Rebuild without trailing "?" if no params remain
 */
export function sanitizeUrl(rawUrl: string): CleanedLink {
  const result: CleanedLink = {
    original: rawUrl,
    cleaned: rawUrl,
    removedParams: [],
    wasModified: false,
  };

  // Some URLs might be malformed or use protocols that the URL
  // constructor can't parse. Return as-is for those.
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    // If we can't parse it, we can't clean it — return untouched
    return result;
  }

  // Only process http/https URLs. Other schemes like mailto:, tel:, etc.
  // shouldn't have their query params stripped
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return result;
  }

  // Collect the params to remove (can't delete while iterating)
  const paramsToRemove: string[] = [];
  parsedUrl.searchParams.forEach((_value, key) => {
    if (isTrackingParam(key)) {
      paramsToRemove.push(key);
    }
  });

  // Nothing to strip — return original untouched
  if (paramsToRemove.length === 0) {
    return result;
  }

  // Remove all tracking params
  for (const param of paramsToRemove) {
    parsedUrl.searchParams.delete(param);
  }

  result.cleaned = parsedUrl.toString();
  result.removedParams = paramsToRemove;
  result.wasModified = true;

  return result;
}

/**
 * Extract all HTTP/HTTPS URLs from a text string.
 * Used by text-based processors (markdown, plain text).
 */
export function extractUrlsFromText(text: string): string[] {
  // This regex matches http:// or https:// URLs, allowing most valid URL characters
  const urlRegex = /https?:\/\/[^\s<>"')\]}\u0080-\uffff]+/gi;
  const matches = text.match(urlRegex);
  return matches ?? [];
}

/**
 * Replace URLs in a text string with their cleaned versions.
 * Handles the tricky part of replacing inline URLs while
 * preserving surrounding text structure.
 */
export function replaceUrlsInText(
  text: string,
  sanitizeFn: (url: string) => CleanedLink
): { cleanedText: string; cleanedLinks: CleanedLink[] } {
  const urlRegex = /https?:\/\/[^\s<>"')\]}\u0080-\uffff]+/gi;
  const cleanedLinks: CleanedLink[] = [];

  const cleanedText = text.replace(urlRegex, (match) => {
    // Strip trailing punctuation that's likely not part of the URL
    // (periods, commas, semicolons at the end of sentences)
    let url = match;
    const trailingPunctuation = url.match(/([.,;!?:]+)$/);
    if (trailingPunctuation) {
      url = url.slice(0, -trailingPunctuation[1].length);
    }

    const result = sanitizeFn(url);
    if (result.wasModified) {
      cleanedLinks.push(result);
    }

    // Reattach trailing punctuation if there was any
    return trailingPunctuation
      ? result.cleaned + trailingPunctuation[1]
      : result.cleaned;
  });

  return { cleanedText, cleanedLinks };
}
