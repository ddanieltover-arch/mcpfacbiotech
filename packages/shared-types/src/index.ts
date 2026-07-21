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

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
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

export interface OrderDetail extends OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  notes?: string;
  purchaseOrderNumber?: string;
  quoteId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
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
