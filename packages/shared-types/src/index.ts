// ─── API Response Envelope (Appendix C) ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  metadata?: ApiMetadata;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: ApiMetadata;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
}

export interface ApiMetadata {
  requestId: string;
  timestamp: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profileId?: string;
}

export type UserRole =
  | 'GUEST'
  | 'CUSTOMER'
  | 'RESEARCH_CUSTOMER'
  | 'DISTRIBUTOR'
  | 'WHOLESALE_CUSTOMER'
  | 'SUPPORT'
  | 'CONTENT_EDITOR'
  | 'INVENTORY_MANAGER'
  | 'ADMINISTRATOR'
  | 'SUPER_ADMINISTRATOR';

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type ProductAvailability =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'MADE_TO_ORDER'
  | 'BACK_ORDER'
  | 'PRE_ORDER'
  | 'UNAVAILABLE'
  | 'DISCONTINUED';

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  sku: string;
  casNumber?: string;
  purity?: string;
  price?: number;
  availability: ProductAvailability;
  imageUrl?: string;
  categoryName?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  /** Effective retail price = product base price + priceModifier */
  price?: number;
  stockQuantity: number;
  sku?: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  shortDescription?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  sequence?: string;
  storage?: string;
  solubility?: string;
  appearance?: string;
  minimumOrderQuantity: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  isFeatured: boolean;
  status: ProductStatus;
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  downloads: ProductDownload[];
  relatedProducts: ProductSummary[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSpecification {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
}

export interface ProductDownload {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  fileSize?: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

/** Manual payment options shown at checkout (no gateway capture). */
export type PaymentMethod =
  | 'BITCOIN'
  | 'USDT'
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'CHIME'
  | 'CASH_APP';

export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'BITCOIN',
    label: 'Bitcoin',
    description: 'Pay with BTC. Wallet details are sent after order placement.',
  },
  {
    value: 'USDT',
    label: 'USDT',
    description: 'Pay with USDT (stablecoin). Transfer details follow by email.',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit card',
    description: 'Card payment arranged manually with our team — no online charge at checkout.',
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank transfer',
    description: 'Wire / ACH / SEPA. Banking details are provided after confirmation.',
  },
  {
    value: 'CHIME',
    label: 'Chime',
    description: 'Pay via Chime. Recipient details are shared after your order is placed.',
  },
  {
    value: 'CASH_APP',
    label: 'Cash App',
    description: 'Pay via Cash App. Cashtag / instructions follow after order placement.',
  },
] as const;

/** Flat-rate shipping options at checkout. */
export type OrderShippingMethod = 'STANDARD' | 'PRIORITY_EXPRESS';

export const SHIPPING_METHOD_OPTIONS: ReadonlyArray<{
  value: OrderShippingMethod;
  label: string;
  eta: string;
  price: number;
}> = [
  {
    value: 'STANDARD',
    label: 'Standard Delivery',
    eta: '3-5 Business Days',
    price: 25,
  },
  {
    value: 'PRIORITY_EXPRESS',
    label: 'Priority Express',
    eta: '1-2 Business Days',
    price: 50,
  },
] as const;

export function getShippingMethodPrice(method: OrderShippingMethod): number {
  return SHIPPING_METHOD_OPTIONS.find((option) => option.value === method)?.price ?? 25;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  shippingMethod?: OrderShippingMethod;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

/** Snapshot of checkout address fields stored on the order. */
export interface OrderAddressSnapshot {
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
}

export interface OrderDetail extends OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  notes?: string;
  purchaseOrderNumber?: string;
  quoteId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  /** Populated on admin / detailed order payloads when available */
  customerEmail?: string;
  customerName?: string;
  organizationName?: string;
  shippingAddress?: OrderAddressSnapshot;
  billingAddress?: OrderAddressSnapshot;
  updatedAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  invoiceIds: string[];
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export type QuoteStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED';

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  expiresAt?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface QuoteStatusHistoryEntry {
  id: string;
  fromStatus?: QuoteStatus;
  toStatus: QuoteStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export interface QuoteDetail extends QuoteSummary {
  subtotal: number;
  shippingCost: number;
  notes?: string;
  purchaseOrderNumber?: string;
  updatedAt: string;
  items: QuoteItem[];
  statusHistory: QuoteStatusHistoryEntry[];
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalAmount: number;
  currency: string;
  dueDate: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceDetail extends InvoiceSummary {
  orderId: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  notes?: string;
  paidAt?: string;
  updatedAt: string;
  items: InvoiceItem[];
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'COA'
  | 'MSDS'
  | 'HPLC'
  | 'TECHNICAL_DATASHEET'
  | 'RESEARCH_DOCUMENT'
  | 'CERTIFICATE'
  | 'INVOICE'
  | 'QUOTE'
  | 'OTHER';

export type DocumentPermission = 'PUBLIC' | 'REGISTERED' | 'CUSTOMER' | 'DISTRIBUTOR' | 'ADMIN';

export interface AdminDocumentSummary {
  id: string;
  title: string;
  type: DocumentType;
  permission: DocumentPermission;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  version: string;
  language: string;
  description?: string;
  isApproved: boolean;
  downloadCount: number;
  productCount: number;
  products: Array<{ id: string; name: string; sku: string; slug: string }>;
  updatedAt: string;
}

export interface AdminMediaSummary {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType: string;
  alt?: string;
  folder: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Public COA / document search result (approved + PUBLIC only). */
export interface DocumentSearchResult {
  id: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  version: string;
  description?: string;
  products: Array<{ name: string; sku: string; slug: string }>;
}

// ─── Support ─────────────────────────────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_RESPONSE' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productSlug?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  notes?: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerGroup =
  | 'RETAIL'
  | 'RESEARCH'
  | 'UNIVERSITY'
  | 'DISTRIBUTOR'
  | 'WHOLESALE'
  | 'GOVERNMENT'
  | 'VIP'
  | 'INSTITUTION';

export interface AccountProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  customerId: string;
  customerGroup: CustomerGroup;
  organizationName?: string;
  department?: string;
  country?: string;
  isVerified: boolean;
  isSuspended: boolean;
}

export interface AddressSummary {
  id: string;
  label?: string;
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
  isDefault: boolean;
}

export interface AccountDashboard {
  profile: AccountProfile;
  counts: {
    orders: number;
    quotes: number;
    invoices: number;
    wishlist: number;
    addresses: number;
  };
  recentOrders: OrderSummary[];
  recentQuotes: QuoteSummary[];
  recentInvoices: InvoiceSummary[];
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED';

// ─── Blog ────────────────────────────────────────────────────────────────────

export type BlogPostStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogContentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/** JSON envelope stored in `BlogPost.content`. */
export interface BlogPostContentPayload {
  readingTime?: string;
  sections: BlogContentSection[];
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  authorName: string;
  publishedAt?: string;
  categoryName?: string;
  tags: string[];
  readingTime?: string;
  isFeatured?: boolean;
}

export interface BlogPostDetail extends BlogPostSummary {
  status: BlogPostStatus;
  content: BlogPostContentPayload;
  updatedAt: string;
}

export interface AdminBlogPostSummary extends BlogPostDetail {
  deletedAt?: string;
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface FaqCategoryPublic {
  id: string;
  name: string;
  sortOrder: number;
  questions: FaqItem[];
}

export interface AdminFaqQuestion {
  id: string;
  categoryId: string;
  categoryName: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: string;
}

export interface AdminFaqCategory {
  id: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
  questionCount: number;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'ORDER_STATUS'
  | 'QUOTE_STATUS'
  | 'INVOICE_AVAILABLE'
  | 'SHIPMENT_UPDATE'
  | 'SUPPORT_REPLY'
  | 'DOCUMENT_UPDATED'
  | 'SYSTEM';

// ─── Admin ───────────────────────────────────────────────────────────────────

/** Staff roles that may access `/admin` and `/api/v1/admin/*`. */
export const ADMIN_ACCESS_ROLES: UserRole[] = [
  'SUPER_ADMINISTRATOR',
  'ADMINISTRATOR',
  'SUPPORT',
  'CONTENT_EDITOR',
  'INVENTORY_MANAGER',
];

export function isAdminRole(role: UserRole | string | undefined | null): boolean {
  if (!role) return false;
  return (ADMIN_ACCESS_ROLES as string[]).includes(role);
}

export interface AdminDashboard {
  counts: {
    products: number;
    publishedProducts: number;
    lowStockProducts: number;
    customers: number;
    pendingQuotes: number;
    pendingOrders: number;
    openOrders: number;
    invoicesIssued: number;
  };
  recentOrders: AdminOrderSummary[];
  recentQuotes: AdminQuoteSummary[];
  recentCustomers: AdminCustomerSummary[];
}

export interface AdminProductSummary {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: ProductStatus;
  availability: ProductAvailability;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  retailPrice?: number;
  isFeatured: boolean;
  isVisible: boolean;
  categoryName?: string;
  updatedAt: string;
}

export interface AdminCategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parentName?: string;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  productCount: number;
  childrenCount: number;
  updatedAt: string;
}

export interface AdminInventoryItem {
  id: string;
  name: string;
  sku: string;
  slug: string;
  status: ProductStatus;
  availability: ProductAvailability;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  leadTimeDays?: number;
  categoryName?: string;
  updatedAt: string;
}

export interface AdminCustomerSummary {
  id: string;
  profileId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  customerGroup: CustomerGroup;
  country?: string;
  isVerified: boolean;
  isSuspended: boolean;
  ordersCount: number;
  quotesCount: number;
  createdAt: string;
}

export interface AdminQuoteSummary {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  customerEmail: string;
  customerName: string;
  organizationName?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  customerEmail: string;
  customerName: string;
  organizationName?: string;
  paymentMethod?: PaymentMethod;
  shippingMethod?: OrderShippingMethod;
  createdAt: string;
}
