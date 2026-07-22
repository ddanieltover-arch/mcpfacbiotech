import type {
  AccountDashboard,
  AccountProfile,
  AddressSummary,
  CartSummary,
  InvoiceDetail,
  InvoiceSummary,
  OrderDetail,
  OrderSummary,
  QuoteDetail,
  QuoteSummary,
} from '@mcpfac/shared-types';
import { apiClient } from '@/lib/api-client';
import { createClient } from '@/lib/supabase/client';

const CART_SESSION_KEY = 'mcpfac-cart-session';

let cachedAccessToken: { token?: string; at: number } | null = null;

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/** Stable guest cart session UUID persisted in localStorage. */
export function getCartSessionId(): string {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  const existing = window.localStorage.getItem(CART_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next = createSessionId();
  window.localStorage.setItem(CART_SESSION_KEY, next);
  return next;
}

async function getAccessToken(): Promise<string | undefined> {
  // Avoid a Supabase round-trip on every cart click; tokens last far longer than 60s.
  const now = Date.now();
  if (cachedAccessToken && now - cachedAccessToken.at < 60_000) {
    return cachedAccessToken.token;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  cachedAccessToken = { token, at: now };
  return token;
}

async function commerceOptions(extraHeaders?: Record<string, string>) {
  const token = await getAccessToken();
  const sessionId = getCartSessionId();
  return {
    token,
    headers: {
      'X-Cart-Session': sessionId,
      ...extraHeaders,
    },
  };
}

export async function fetchCart(): Promise<CartSummary> {
  const options = await commerceOptions();
  const response = await apiClient.get<CartSummary>('/cart', options);
  return response.data;
}

export async function addCartItem(
  productId: string,
  quantity = 1,
  variantId?: string,
): Promise<CartSummary> {
  const options = await commerceOptions();
  try {
    const response = await apiClient.post<CartSummary>(
      '/cart/items',
      { productId, quantity, variantId },
      options,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<CartSummary> {
  const options = await commerceOptions();
  const path = variantId
    ? `/cart/items/${productId}?variantId=${encodeURIComponent(variantId)}`
    : `/cart/items/${productId}`;
  const response = await apiClient.patch<CartSummary>(
    path,
    { quantity, variantId },
    options,
  );
  return response.data;
}

export async function removeCartItem(productId: string, variantId?: string): Promise<CartSummary> {
  const options = await commerceOptions();
  const path = variantId
    ? `/cart/items/${productId}?variantId=${encodeURIComponent(variantId)}`
    : `/cart/items/${productId}`;
  await apiClient.delete(path, options);
  return fetchCart();
}

export async function updateCartNotes(notes: string): Promise<CartSummary> {
  const options = await commerceOptions();
  const response = await apiClient.patch<CartSummary>('/cart', { notes }, options);
  return response.data;
}

export async function clearServerCart(): Promise<CartSummary> {
  const options = await commerceOptions();
  await apiClient.delete('/cart', options);
  return fetchCart();
}

export async function mergeCartOnLogin(): Promise<CartSummary> {
  const options = await commerceOptions();
  if (!options.token) {
    return fetchCart();
  }

  const response = await apiClient.post<CartSummary>('/cart/merge', undefined, options);
  return response.data;
}

export async function createQuoteFromCart(input?: {
  notes?: string;
  purchaseOrderNumber?: string;
}): Promise<QuoteDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<QuoteDetail>(
    '/quotes',
    {
      fromCart: true,
      notes: input?.notes,
      purchaseOrderNumber: input?.purchaseOrderNumber,
    },
    options,
  );
  return response.data;
}

export async function createQuoteFromItems(input: {
  items: Array<{ productId: string; quantity: number; notes?: string }>;
  notes?: string;
  purchaseOrderNumber?: string;
}): Promise<QuoteDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<QuoteDetail>('/quotes', input, options);
  return response.data;
}

export async function listQuotes(page = 1, limit = 20): Promise<{
  items: QuoteSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await commerceOptions();
  const response = await apiClient.getList<QuoteSummary>('/quotes', {
    ...options,
    params: { page, limit },
  });

  return {
    items: response.data.items,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
  };
}

export async function getQuote(id: string): Promise<QuoteDetail> {
  const options = await commerceOptions();
  const response = await apiClient.get<QuoteDetail>(`/quotes/${id}`, options);
  return response.data;
}

export async function submitQuote(id: string): Promise<QuoteDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<QuoteDetail>(`/quotes/${id}/submit`, undefined, options);
  return response.data;
}

export async function checkoutOrder(input: {
  fromCart?: boolean;
  quoteId?: string;
  guestEmail?: string;
  notes?: string;
  purchaseOrderNumber?: string;
  paymentMethod?:
    | 'BITCOIN'
    | 'USDT'
    | 'CREDIT_CARD'
    | 'BANK_TRANSFER'
    | 'CHIME'
    | 'CASH_APP';
  shippingMethod?: 'STANDARD' | 'PRIORITY_EXPRESS';
  shippingAddress?: {
    firstName: string;
    lastName: string;
    organizationName?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}): Promise<OrderDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<OrderDetail>('/orders/checkout', input, options);
  return response.data;
}

export async function listOrders(page = 1, limit = 20): Promise<{
  items: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await commerceOptions();
  const response = await apiClient.getList<OrderSummary>('/orders', {
    ...options,
    params: { page, limit },
  });

  return {
    items: response.data.items,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
  };
}

export async function getOrder(id: string): Promise<OrderDetail> {
  const options = await commerceOptions();
  const response = await apiClient.get<OrderDetail>(`/orders/${id}`, options);
  return response.data;
}

export async function confirmOrder(id: string): Promise<OrderDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<OrderDetail>(`/orders/${id}/confirm`, undefined, options);
  return response.data;
}

export async function cancelOrder(id: string): Promise<OrderDetail> {
  const options = await commerceOptions();
  const response = await apiClient.post<OrderDetail>(`/orders/${id}/cancel`, undefined, options);
  return response.data;
}

export async function listInvoices(page = 1, limit = 20): Promise<{
  items: InvoiceSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const options = await commerceOptions();
  const response = await apiClient.getList<InvoiceSummary>('/invoices', {
    ...options,
    params: { page, limit },
  });

  return {
    items: response.data.items,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
  };
}

export async function getInvoice(id: string): Promise<InvoiceDetail> {
  const options = await commerceOptions();
  const response = await apiClient.get<InvoiceDetail>(`/invoices/${id}`, options);
  return response.data;
}

export async function getAccountDashboard(): Promise<AccountDashboard> {
  const options = await commerceOptions();
  const response = await apiClient.get<AccountDashboard>('/account/dashboard', options);
  return response.data;
}

export async function getAccountProfile(): Promise<AccountProfile> {
  const options = await commerceOptions();
  const response = await apiClient.get<AccountProfile>('/account/profile', options);
  return response.data;
}

export async function updateAccountProfile(
  input: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    organizationName: string;
    department: string;
    country: string;
  }>,
): Promise<AccountProfile> {
  const options = await commerceOptions();
  const response = await apiClient.patch<AccountProfile>('/account/profile', input, options);
  return response.data;
}

export async function listAddresses(): Promise<AddressSummary[]> {
  const options = await commerceOptions();
  const response = await apiClient.get<AddressSummary[]>('/account/addresses', options);
  return response.data;
}

export async function createAddress(
  input: Omit<AddressSummary, 'id'>,
): Promise<AddressSummary> {
  const options = await commerceOptions();
  const response = await apiClient.post<AddressSummary>('/account/addresses', input, options);
  return response.data;
}

export async function updateAddress(
  id: string,
  input: Omit<AddressSummary, 'id'>,
): Promise<AddressSummary> {
  const options = await commerceOptions();
  const response = await apiClient.patch<AddressSummary>(
    `/account/addresses/${id}`,
    input,
    options,
  );
  return response.data;
}

export async function deleteAddress(id: string): Promise<void> {
  const options = await commerceOptions();
  await apiClient.delete(`/account/addresses/${id}`, options);
}
