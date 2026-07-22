import type { BlogPostContentPayload, BlogContentSection } from '@mcpfac/shared-types';

export function parseBlogContent(raw: string): BlogPostContentPayload {
  try {
    const parsed = JSON.parse(raw) as BlogPostContentPayload | BlogContentSection[];
    if (Array.isArray(parsed)) {
      return { sections: parsed };
    }
    if (parsed && Array.isArray(parsed.sections)) {
      return {
        readingTime: parsed.readingTime,
        sections: parsed.sections,
      };
    }
  } catch {
    // fall through to plain text
  }

  const paragraphs = raw
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    sections: paragraphs.length
      ? [{ heading: 'Article', paragraphs }]
      : [{ heading: 'Article', paragraphs: [raw.trim() || ''] }],
  };
}

export function serializeBlogContent(payload: BlogPostContentPayload): string {
  return JSON.stringify({
    readingTime: payload.readingTime,
    sections: payload.sections,
  });
}

export function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
