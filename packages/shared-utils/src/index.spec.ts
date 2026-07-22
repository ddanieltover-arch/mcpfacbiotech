import {
  calculateOffset,
  calculateTotalPages,
  capitalize,
  clamp,
  formatCurrency,
  formatFileSize,
  formatStatusLabel,
  generateSlug,
  getFileExtension,
  isExpired,
  isValidCasNumber,
  isValidUuid,
  truncate,
} from './index';

describe('formatCurrency', () => {
  it('formats USD with two decimals', () => {
    expect(formatCurrency(169)).toBe('$169.00');
    expect(formatCurrency(12.5)).toBe('$12.50');
  });
});

describe('generateSlug', () => {
  it('normalizes text to kebab-case', () => {
    expect(generateSlug('BPC-157 Peptide')).toBe('bpc-157-peptide');
    expect(generateSlug('  Hello World!  ')).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('leaves short strings unchanged', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });

  it('adds ellipsis when over max length', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter only', () => {
    expect(capitalize('pending')).toBe('Pending');
    expect(capitalize('')).toBe('');
  });
});

describe('formatStatusLabel', () => {
  it('converts enum values to title case', () => {
    expect(formatStatusLabel('PENDING_REVIEW')).toBe('Pending Review');
  });
});

describe('clamp', () => {
  it('bounds values between min and max', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('isExpired', () => {
  it('detects past dates', () => {
    expect(isExpired('2000-01-01T00:00:00.000Z')).toBe(true);
    expect(isExpired('2099-01-01T00:00:00.000Z')).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats bytes to human units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });
});

describe('getFileExtension', () => {
  it('returns lowercase extension without dot', () => {
    expect(getFileExtension('report.PDF')).toBe('pdf');
    expect(getFileExtension('noext')).toBe('');
  });
});

describe('isValidCasNumber', () => {
  it('validates CAS registry format', () => {
    expect(isValidCasNumber('50-78-2')).toBe(true);
    expect(isValidCasNumber('invalid')).toBe(false);
  });
});

describe('isValidUuid', () => {
  it('validates UUID v4', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('not-a-uuid')).toBe(false);
  });
});

describe('pagination helpers', () => {
  it('calculateTotalPages rounds up', () => {
    expect(calculateTotalPages(0, 20)).toBe(0);
    expect(calculateTotalPages(21, 20)).toBe(2);
  });

  it('calculateOffset uses 1-based pages', () => {
    expect(calculateOffset(1, 20)).toBe(0);
    expect(calculateOffset(3, 20)).toBe(40);
  });
});
