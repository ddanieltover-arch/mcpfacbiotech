import { z } from 'zod';

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    organizationName: z.string().max(200).optional(),
    organizationType: z
      .enum(['INDIVIDUAL', 'UNIVERSITY', 'LABORATORY', 'COMPANY', 'DISTRIBUTOR', 'INSTITUTION'])
      .optional(),
    department: z.string().max(200).optional(),
    country: z.string().min(2, 'Country is required').max(100),
    phone: z.string().max(30).optional(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(300),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  organizationName: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ─── Quote Request ───────────────────────────────────────────────────────────

export const quoteItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  notes: z.string().max(1000).optional(),
});

export const quoteRequestSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'At least one product is required').optional(),
  fromCart: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
  purchaseOrderNumber: z.string().max(100).optional(),
}).refine((data) => data.fromCart === true || (data.items?.length ?? 0) > 0, {
  message: 'Provide items or set fromCart=true',
  path: ['items'],
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const updateCartSchema = z.object({
  notes: z.string().max(5000).optional(),
});

export type UpdateCartInput = z.infer<typeof updateCartSchema>;

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().max(100).optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  organizationName: z.string().max(200).optional(),
  addressLine1: z.string().min(1, 'Address is required').max(300),
  addressLine2: z.string().max(300).optional(),
  city: z.string().min(1, 'City is required').max(100),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    fromCart: z.boolean().optional(),
    quoteId: z.string().uuid().optional(),
    notes: z.string().max(5000).optional(),
    purchaseOrderNumber: z.string().max(100).optional(),
    paymentMethod: z
      .enum(['BITCOIN', 'USDT', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHIME', 'CASH_APP'])
      .default('BANK_TRANSFER'),
    shippingMethod: z.enum(['STANDARD', 'PRIORITY_EXPRESS']).default('STANDARD'),
    shippingAddressId: z.string().uuid().optional(),
    billingAddressId: z.string().uuid().optional(),
    shippingAddress: addressSchema.optional(),
    billingAddress: addressSchema.optional(),
  })
  .refine((data) => data.fromCart === true || Boolean(data.quoteId), {
    message: 'Provide fromCart=true or quoteId',
    path: ['fromCart'],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ─── Newsletter ──────────────────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ─── Support Ticket ──────────────────────────────────────────────────────────

export const supportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(300),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(10000),
  orderId: z.string().uuid().optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

// ─── Product Filters ─────────────────────────────────────────────────────────

export const productFilterSchema = z.object({
  category: z.string().optional(),
  purity: z.string().optional(),
  availability: z
    .enum([
      'IN_STOCK',
      'LOW_STOCK',
      'MADE_TO_ORDER',
      'BACK_ORDER',
      'PRE_ORDER',
      'UNAVAILABLE',
      'DISCONTINUED',
    ])
    .optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  researchType: z.string().optional(),
  storageCondition: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
