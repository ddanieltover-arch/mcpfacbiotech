import type { CartItem, CartSummary } from '@mcpfac/shared-types';
import type { Prisma } from '@prisma/client';
import { CommercePricingService } from '@/modules/commerce/commerce-pricing';

type CartWithItems = Prisma.ShoppingCartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            sku: true;
            slug: true;
            retailPrice: true;
            images: {
              select: {
                url: true;
                isPrimary: true;
                sortOrder: true;
              };
            };
          };
        };
        variant: {
          select: {
            id: true;
            name: true;
            value: true;
            sku: true;
            priceModifier: true;
          };
        };
      };
    };
  };
}>;

export function toCartSummary(
  cart: CartWithItems,
  pricing: CommercePricingService,
): CartSummary {
  const items: CartItem[] = cart.items.map((item) =>
    pricing.toCartLine(item.id, item.product, item.quantity, item.variant),
  );

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    itemCount,
    subtotal,
    currency: 'USD',
    notes: cart.notes ?? undefined,
  };
}

export function emptyCartSummary(): CartSummary {
  return {
    id: '',
    items: [],
    itemCount: 0,
    subtotal: 0,
    currency: 'USD',
  };
}
