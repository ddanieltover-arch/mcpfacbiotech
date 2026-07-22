import {
  addCartItemSchema,
  checkoutSchema,
  paginationSchema,
  quoteRequestSchema,
  registerSchema,
  updateCartItemSchema,
} from './index';

const validAddress = {
  firstName: 'Ada',
  lastName: 'Lab',
  addressLine1: '1 Research Way',
  city: 'Boston',
  postalCode: '02101',
  country: 'United States',
};

describe('paginationSchema', () => {
  it('coerces and defaults page/limit', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.direction).toBe('desc');
  });

  it('rejects limit above 100', () => {
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow();
  });
});

describe('addCartItemSchema', () => {
  it('requires a UUID product id and positive quantity', () => {
    const result = addCartItemSchema.parse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 2,
    });
    expect(result.quantity).toBe(2);
  });

  it('defaults quantity to 1', () => {
    const result = addCartItemSchema.parse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.quantity).toBe(1);
  });
});

describe('updateCartItemSchema', () => {
  it('allows zero quantity for removal', () => {
    expect(updateCartItemSchema.parse({ quantity: 0 }).quantity).toBe(0);
  });

  it('rejects negative quantity', () => {
    expect(() => updateCartItemSchema.parse({ quantity: -1 })).toThrow();
  });
});

describe('quoteRequestSchema', () => {
  it('accepts fromCart without explicit items', () => {
    expect(quoteRequestSchema.parse({ fromCart: true })).toEqual({ fromCart: true });
  });

  it('requires items when fromCart is not set', () => {
    expect(() => quoteRequestSchema.parse({})).toThrow();
  });
});

describe('checkoutSchema', () => {
  it('accepts cart checkout with shipping address', () => {
    const result = checkoutSchema.parse({
      fromCart: true,
      paymentMethod: 'BANK_TRANSFER',
      shippingMethod: 'STANDARD',
      shippingAddress: validAddress,
    });
    expect(result.shippingMethod).toBe('STANDARD');
  });

  it('accepts quote conversion by quoteId', () => {
    const result = checkoutSchema.parse({
      quoteId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.quoteId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects when neither fromCart nor quoteId is provided', () => {
    expect(() =>
      checkoutSchema.parse({
        shippingAddress: validAddress,
      }),
    ).toThrow(/fromCart=true or quoteId/);
  });

  it('rejects invalid payment methods', () => {
    expect(() =>
      checkoutSchema.parse({
        fromCart: true,
        paymentMethod: 'PAYPAL',
      }),
    ).toThrow();
  });
});

describe('registerSchema', () => {
  it('requires matching passwords and terms acceptance', () => {
    const valid = registerSchema.parse({
      email: 'lab@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
      firstName: 'Ada',
      lastName: 'Lab',
      country: 'US',
      agreeToTerms: true,
    });
    expect(valid.email).toBe('lab@example.com');
  });

  it('rejects weak passwords', () => {
    expect(() =>
      registerSchema.parse({
        email: 'lab@example.com',
        password: 'short',
        confirmPassword: 'short',
        firstName: 'Ada',
        lastName: 'Lab',
        country: 'US',
        agreeToTerms: true,
      }),
    ).toThrow();
  });
});
