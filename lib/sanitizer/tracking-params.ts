// ─── Tracking Parameter Blocklist ───
// These are the URL query parameters we strip from every link.
// The list covers major analytics, advertising, email marketing,
// and social media tracking platforms.

export const TRACKING_PARAM_PATTERNS: string[] = [
  // UTM parameters (Google Analytics campaign tracking)
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_cid",
  "utm_reader",
  "utm_name",
  "utm_pubreferrer",
  "utm_swu",
  "utm_viz_id",
  "utm_brand",

  // Google Ads
  "gclid",
  "gclsrc",
  "dclid",
  "gad_source",

  // Facebook / Meta
  "fbclid",
  "fb_action_ids",
  "fb_action_types",
  "fb_ref",
  "fb_source",

  // HubSpot
  "_hsenc",
  "_hsmi",
  "hsCtaTracking",
  "__hssc",
  "__hstc",
  "__hsfp",

  // Mailchimp
  "mc_cid",
  "mc_eid",

  // Marketo
  "mkt_tok",

  // Microsoft
  "msclkid",

  // LinkedIn
  "li_fat_id",

  // Adobe Analytics
  "ef_id",
  "s_kwcid",

  // Other trackers
  "ref",
  "referrer",
  "reference",
  "click_id",
  "clickid",
  "si",
  "src",
  "source",
  "_ga",
  "_gl",
  "_gid",
  "vero_id",
  "oly_anon_id",
  "oly_enc_id",
  "_openstat",
  "wickedid",
  "igshid", // Instagram
  "twclid", // Twitter/X
  "ttclid", // TikTok
  "ScCid", // Salesforce
  "ss_source",
  "ss_campaign", // SendFox
];

// Prefix patterns catch tracking params that follow a naming convention
// e.g., utm_custom_campaign still gets caught by the "utm_" prefix
export const TRACKING_PARAM_PREFIXES: string[] = [
  "utm_",
  "_ga",
  "_gl",
  "_hs",
  "__hs",
  "mc_",
  "fb_",
];

/**
 * Check if a query parameter name is a tracking parameter.
 * Matches against both exact patterns and prefix patterns.
 */
export function isTrackingParam(paramName: string): boolean {
  // Exact match check — fast path for known params
  if (TRACKING_PARAM_PATTERNS.includes(paramName)) {
    return true;
  }

  // Prefix match — catches variations like utm_custom_something
  return TRACKING_PARAM_PREFIXES.some((prefix) =>
    paramName.toLowerCase().startsWith(prefix)
  );
}
