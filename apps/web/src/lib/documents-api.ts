import type { DocumentSearchResult, DocumentType } from '@mcpfac/shared-types';
import { apiClient } from '@/lib/api-client';

export async function searchDocuments(params: {
  q?: string;
  type?: DocumentType | string;
  limit?: number;
}): Promise<DocumentSearchResult[]> {
  const response = await apiClient.get<DocumentSearchResult[]>('/documents/search', {
    params,
  });
  return response.data;
}
