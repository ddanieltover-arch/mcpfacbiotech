import type {
  AdminCategorySummary,
  AdminCustomerSummary,
  AdminDashboard,
  AdminInventoryItem,
  AdminOrderSummary,
  AdminProductSummary,
  AdminQuoteSummary,
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

  return {
    token: session?.access_token,
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
): Promise<OrderDetail & { customerEmail: string; internalNotes?: string }> {
  const options = await adminOptions();
  const response = await apiClient.get<OrderDetail & { customerEmail: string; internalNotes?: string }>(
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
