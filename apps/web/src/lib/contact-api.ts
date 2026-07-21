import { apiClient } from '@/lib/api-client';

export type ContactMessageInput = {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
};

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  await apiClient.post<{ sent: boolean }>('/contact', input);
}
