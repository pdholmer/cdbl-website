/**
 * Schedule location formatting helpers.
 *
 * Synced calendar events arrive with raw location strings such as
 *   "4w400 Stonecrest Drive,,Elgin,IL-60124 US"
 *   "12N475 Park St ,Burlington,IL-60109 US"
 *   "41W625 Russell Road,Elgin,IL-60124 US"
 *
 * Local CDBL fields should display as a friendly facility name in the
 * calendar grid, and as a clean street address (no city/state/zip) in
 * the event detail modal. The original raw string is preserved so the
 * Google Maps link still resolves correctly.
 */

// Keyword → facility name. Matches case-insensitively against the raw
// location string. Order matters: first match wins.
const FACILITY_KEYWORDS: { name: string; keywords: string[] }[] = [
  { name: "Stonecrest Fields", keywords: ["stonecrest"] },
  { name: "Plato Fields", keywords: ["plato", "russell rd", "russell road"] },
  {
    name: "Burlington Fields",
    keywords: ["burlington fields", "park st", "park street", "12n475"],
  },
];

/**
 * Returns a short facility/field label for the calendar grid.
 * Falls back to the street portion of the address when no known
 * facility matches.
 */
export function getFacilityLabel(rawLocation?: string | null): string {
  if (!rawLocation) return "";
  const lower = rawLocation.toLowerCase();
  for (const f of FACILITY_KEYWORDS) {
    if (f.keywords.some((k) => lower.includes(k))) {
      return f.name;
    }
  }
  // Fallback: return the street/first segment of the address.
  return getStreetAddress(rawLocation);
}

/**
 * Returns just the street address (no city/state/zip) for the event
 * detail view. Strips trailing ",City,ST-ZIP US" style suffixes.
 */
export function getStreetAddress(rawLocation?: string | null): string {
  if (!rawLocation) return "";
  const parts = rawLocation
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return rawLocation.trim();
  return parts[0];
}
