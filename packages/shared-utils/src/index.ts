// ─── Currency Formatting ─────────────────────────────────────────────────────

/**
 * Format a number as USD currency.
 * Extend for multi-currency support in the future.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Slug Generation ─────────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── String Helpers ──────────────────────────────────────────────────────────

/**
 * Truncate a string to a specified length with an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format a status enum value for display (e.g. PENDING_REVIEW → "Pending Review").
 */
export function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

// ─── Number Helpers ──────────────────────────────────────────────────────────

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

/**
 * Check if a date string represents a date in the past.
 */
export function isExpired(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

// ─── File Helpers ────────────────────────────────────────────────────────────

/**
 * Format file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.min(i, sizes.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`;
}

/**
 * Extract the file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot + 1).toLowerCase();
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Check if a string looks like a valid CAS number (e.g. 50-78-2).
 */
export function isValidCasNumber(cas: string): boolean {
  return /^\d{2,7}-\d{2}-\d$/.test(cas);
}

/**
 * Check if a string is a valid UUID v4.
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// ─── Pagination Helpers ──────────────────────────────────────────────────────

/**
 * Calculate total pages from total items and page size.
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Calculate the offset for a given page and limit.
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
