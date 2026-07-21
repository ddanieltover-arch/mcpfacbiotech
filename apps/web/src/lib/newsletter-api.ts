import { apiClient } from '@/lib/api-client';

export async function subscribeNewsletter(email: string): Promise<void> {
  await apiClient.post<{ subscribed: boolean }>('/newsletter/subscribe', {
    email: email.trim().toLowerCase(),
  });
}
