/** Convert arbitrary text to a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 300);
}

/** True when value looks like a UUID (legacy primary keys). */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/** Parse a price value from string/number/null. */
export function parsePrice(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Coerce legacy truthy values. */
export function parseBoolean(value: unknown, defaultValue = true): boolean {
  if (value == null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).toLowerCase().trim();
  if (['true', '1', 'yes', 'y', 'published', 'active'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'draft', 'inactive', 'hidden'].includes(normalized)) return false;
  return defaultValue;
}

/** Read a column from a legacy row using the configured field name. */
export function col(row: Record<string, unknown>, field?: string): unknown {
  if (!field) return undefined;
  return row[field];
}

/** Read string column with fallback. */
export function colString(row: Record<string, unknown>, field?: string, fallback = ''): string {
  const value = col(row, field);
  if (value == null) return fallback;
  return String(value).trim();
}

/** Read optional string column. */
export function colOptionalString(row: Record<string, unknown>, field?: string): string | undefined {
  const value = colString(row, field);
  return value.length > 0 ? value : undefined;
}
