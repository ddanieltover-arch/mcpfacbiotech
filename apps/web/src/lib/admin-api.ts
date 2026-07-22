import type {
  AdminBlogPostSummary,
  AdminCategorySummary,
  AdminCustomerSummary,
  AdminDashboard,
  AdminDocumentSummary,
  AdminFaqCategory,
  AdminFaqQuestion,
  AdminInventoryItem,
  AdminMediaSummary,
  AdminOrderSummary,
  AdminProductSummary,
  AdminQuoteSummary,
  BlogPostStatus,
  DocumentType,
  OrderDetail,
  ProductDetail,
  ProductStatus,
  QuoteDetail,
} from '@mcpfac/shared-types';
import { apiClient } from '@/lib/api-client';
import { createClient } from '@/lib/supabase/client';

async function adminOptions() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not signed in — admin API requires a session');
  }

  return {
    token: session.access_token,
  };
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const options = await adminOptions();
  const response = await apiClient.get<AdminDashboard>('/admin/dashboard', options);
  return response.data;
}

export async function listAdminProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus | string;
}): Promise<{
  items: AdminProductSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminProductSummary>('/admin/products', {
    ...options,
    params,
  });
  return response.data;
}

export async function getAdminProduct(id: string): Promise<ProductDetail> {
  const options = await adminOptions();
  const response = await apiClient.get<ProductDetail>(`/admin/products/${id}`, options);
  return response.data;
}

export async function updateAdminProduct(
  id: string,
  body: Record<string, unknown>,
): Promise<ProductDetail> {
  const options = await adminOptions();
  const response = await apiClient.patch<ProductDetail>(`/admin/products/${id}`, body, options);
  return response.data;
}

export async function listAdminQuotes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{
  items: AdminQuoteSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminQuoteSummary>('/admin/quotes', {
    ...options,
    params,
  });
  return response.data;
}

export async function getAdminQuote(
  id: string,
): Promise<QuoteDetail & { customerEmail: string; internalNotes?: string }> {
  const options = await adminOptions();
  const response = await apiClient.get<QuoteDetail & { customerEmail: string; internalNotes?: string }>(
    `/admin/quotes/${id}`,
    options,
  );
  return response.data;
}

export async function reviewAdminQuote(id: string, note?: string) {
  const options = await adminOptions();
  const response = await apiClient.post(`/admin/quotes/${id}/review`, { note }, options);
  return response.data;
}

export async function approveAdminQuote(id: string, note?: string) {
  const options = await adminOptions();
  const response = await apiClient.post(`/admin/quotes/${id}/approve`, { note }, options);
  return response.data;
}

export async function rejectAdminQuote(id: string, note?: string) {
  const options = await adminOptions();
  const response = await apiClient.post(`/admin/quotes/${id}/reject`, { note }, options);
  return response.data;
}

export async function listAdminOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{
  items: AdminOrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminOrderSummary>('/admin/orders', {
    ...options,
    params,
  });
  return response.data;
}

export async function getAdminOrder(
  id: string,
): Promise<OrderDetail & { internalNotes?: string }> {
  const options = await adminOptions();
  const response = await apiClient.get<OrderDetail & { internalNotes?: string }>(
    `/admin/orders/${id}`,
    options,
  );
  return response.data;
}

export async function updateAdminOrderStatus(
  id: string,
  status: string,
  note?: string,
): Promise<OrderDetail> {
  const options = await adminOptions();
  const response = await apiClient.patch<OrderDetail>(
    `/admin/orders/${id}/status`,
    { status, note },
    options,
  );
  return response.data;
}

export async function listAdminCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  suspended?: string;
}): Promise<{
  items: AdminCustomerSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminCustomerSummary>('/admin/customers', {
    ...options,
    params,
  });
  return response.data;
}

export async function updateAdminCustomer(
  id: string,
  body: { isSuspended?: boolean; isVerified?: boolean; notes?: string },
): Promise<AdminCustomerSummary> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminCustomerSummary>(
    `/admin/customers/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function listAdminCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  visible?: string;
}): Promise<{
  items: AdminCategorySummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminCategorySummary>('/admin/categories', {
    ...options,
    params,
  });
  return response.data;
}

export async function createAdminCategory(body: {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
}): Promise<AdminCategorySummary> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminCategorySummary>('/admin/categories', body, options);
  return response.data;
}

export async function updateAdminCategory(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminCategorySummary> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminCategorySummary>(
    `/admin/categories/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/categories/${id}`, options);
}

export async function listAdminInventory(params?: {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: string;
  availability?: string;
}): Promise<{
  items: AdminInventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminInventoryItem>('/admin/inventory', {
    ...options,
    params,
  });
  return response.data;
}

export async function updateAdminInventory(
  id: string,
  body: {
    stockQuantity?: number;
    lowStockThreshold?: number;
    availability?: string;
    leadTimeDays?: number;
  },
): Promise<AdminInventoryItem> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminInventoryItem>(
    `/admin/inventory/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function listAdminDocuments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: DocumentType | string;
  approved?: string;
}): Promise<{
  items: AdminDocumentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminDocumentSummary>('/admin/documents', {
    ...options,
    params,
  });
  return response.data;
}

export async function createAdminDocument(body: {
  title: string;
  type: DocumentType | string;
  fileUrl: string;
  fileName: string;
  permission?: string;
  version?: string;
  description?: string;
  isApproved?: boolean;
  productId?: string;
}): Promise<AdminDocumentSummary> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminDocumentSummary>('/admin/documents', body, options);
  return response.data;
}

export async function updateAdminDocument(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminDocumentSummary> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminDocumentSummary>(
    `/admin/documents/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function deleteAdminDocument(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/documents/${id}`, options);
}

export async function attachAdminDocumentProduct(
  documentId: string,
  productId: string,
): Promise<AdminDocumentSummary> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminDocumentSummary>(
    `/admin/documents/${documentId}/products`,
    { productId },
    options,
  );
  return response.data;
}

export async function detachAdminDocumentProduct(
  documentId: string,
  productId: string,
): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/documents/${documentId}/products/${productId}`, options);
}

export async function listAdminMedia(params?: {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
}): Promise<{
  items: AdminMediaSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminMediaSummary>('/admin/media', {
    ...options,
    params,
  });
  return response.data;
}

export async function createAdminMedia(body: {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize?: number;
  alt?: string;
  folder?: string;
}): Promise<AdminMediaSummary> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminMediaSummary>('/admin/media', body, options);
  return response.data;
}

export async function updateAdminMedia(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminMediaSummary> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminMediaSummary>(`/admin/media/${id}`, body, options);
  return response.data;
}

export async function deleteAdminMedia(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/media/${id}`, options);
}

export async function listAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus | string;
}): Promise<{
  items: AdminBlogPostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminBlogPostSummary>('/admin/blog', {
    ...options,
    params,
  });
  return response.data;
}

export async function createAdminBlogPost(body: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  authorName?: string;
  status?: BlogPostStatus;
  categoryName?: string;
  readingTime?: string;
  isFeatured?: boolean;
  publishedAt?: string;
}): Promise<AdminBlogPostSummary> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminBlogPostSummary>('/admin/blog', body, options);
  return response.data;
}

export async function updateAdminBlogPost(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminBlogPostSummary> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminBlogPostSummary>(`/admin/blog/${id}`, body, options);
  return response.data;
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/blog/${id}`, options);
}

export async function listAdminFaqCategories(): Promise<AdminFaqCategory[]> {
  const options = await adminOptions();
  const response = await apiClient.get<AdminFaqCategory[]>('/admin/faq/categories', options);
  return response.data;
}

export async function createAdminFaqCategory(body: {
  name: string;
  sortOrder?: number;
  isVisible?: boolean;
}): Promise<AdminFaqCategory> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminFaqCategory>('/admin/faq/categories', body, options);
  return response.data;
}

export async function updateAdminFaqCategory(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminFaqCategory> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminFaqCategory>(
    `/admin/faq/categories/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function deleteAdminFaqCategory(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/faq/categories/${id}`, options);
}

export async function listAdminFaqQuestions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  visible?: string;
}): Promise<{
  items: AdminFaqQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await adminOptions();
  const response = await apiClient.getList<AdminFaqQuestion>('/admin/faq/questions', {
    ...options,
    params,
  });
  return response.data;
}

export async function createAdminFaqQuestion(body: {
  categoryId: string;
  question: string;
  answer: string;
  sortOrder?: number;
  isVisible?: boolean;
}): Promise<AdminFaqQuestion> {
  const options = await adminOptions();
  const response = await apiClient.post<AdminFaqQuestion>('/admin/faq/questions', body, options);
  return response.data;
}

export async function updateAdminFaqQuestion(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminFaqQuestion> {
  const options = await adminOptions();
  const response = await apiClient.patch<AdminFaqQuestion>(
    `/admin/faq/questions/${id}`,
    body,
    options,
  );
  return response.data;
}

export async function deleteAdminFaqQuestion(id: string): Promise<void> {
  const options = await adminOptions();
  await apiClient.delete(`/admin/faq/questions/${id}`, options);
}
