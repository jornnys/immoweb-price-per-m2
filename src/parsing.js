/**
 * Parse a price string from an immoweb listing card.
 * Returns null for price ranges (containing " - " or "–") or invalid input.
 * Handles both EN format (€286,470*) and NL/FR format (€ 145.000).
 */
export function parsePrice(text) {
  if (!text || text.includes(" - ") || text.includes("\u2013")) return null;
  const cleaned = text.replace(/[€*\s.]/g, "").replace(/,/g, "");
  const value = parseInt(cleaned, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Parse a surface area string containing "m²".
 * Returns the numeric value in m², or null if not found.
 */
export function parseSurface(text) {
  if (!text) return null;
  const match = text.match(/([\d,.]+)\s*m²/);
  if (!match) return null;
  const value = parseInt(match[1].replace(/[.,]/g, ""), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Calculate price per m² and return a formatted string.
 * Returns null if inputs are invalid.
 */
export function calculatePricePerM2(price, surface) {
  if (!price || !surface || surface === 0) return null;
  return Math.round(price / surface);
}

/**
 * Format a price/m² value as a display string using Belgian locale.
 */
export function formatPricePerM2(value) {
  if (!Number.isFinite(value)) return null;
  const formatted = new Intl.NumberFormat("de-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted}/m²`;
}
