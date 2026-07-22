import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { CartSummary } from '@mcpfac/shared-types';
import type { ShoppingCart } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { CommercePricingService } from '@/modules/commerce/commerce-pricing';
import { emptyCartSummary, toCartSummary } from './cart.mapper';

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
          retailPrice: true,
          images: {
            take: 1,
            orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
            select: {
              url: true,
              isPrimary: true,
              sortOrder: true,
            },
          },
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          value: true,
          sku: true,
          priceModifier: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
    private readonly pricing: CommercePricingService,
  ) {}

  async getCart(profileId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.resolveCart({
      profileId,
      sessionId,
      createIfMissing: false,
    });

    if (!cart) {
      return emptyCartSummary();
    }

    return this.mapCart(cart.id);
  }

  async addItem(
    productId: string,
    quantity: number,
    profileId?: string,
    sessionId?: string,
    variantId?: string,
  ): Promise<CartSummary> {
    const [product, cart] = await Promise.all([
      this.pricing.loadSellableProduct(productId, {
        requirePrice: true,
        variantId,
      }),
      this.resolveCart({
        profileId,
        sessionId,
        createIfMissing: true,
      }),
    ]);

    this.pricing.assertQuantity(product, quantity);

    if (!cart) {
      throw new BadRequestException('Unable to resolve shopping cart');
    }

    const resolvedVariantId = product.variantId ?? null;


    const existing = await this.findCartItem(
      cart.id,
      productId,
      resolvedVariantId ?? undefined,
    );

    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      this.pricing.assertQuantity(product, nextQuantity);
      // Atomic increment avoids lost updates when two adds race.
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      try {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            variantId: resolvedVariantId,
            quantity,
          },
        });
      } catch (error) {
        // Concurrent create of the same line — fall back to increment.
        const retry = await this.findCartItem(
          cart.id,
          productId,
          resolvedVariantId ?? undefined,
        );
        if (!retry) {
          throw error;
        }
        const nextQuantity = retry.quantity + quantity;
        this.pricing.assertQuantity(product, nextQuantity);
        await this.prisma.cartItem.update({
          where: { id: retry.id },
          data: { quantity: { increment: quantity } },
        });
      }
    }

    return this.mapCart(cart.id);
  }

  async updateItem(
    productId: string,
    quantity: number,
    profileId?: string,
    sessionId?: string,
    variantId?: string,
  ): Promise<CartSummary> {
    const cart = await this.resolveCart({
      profileId,
      sessionId,
      createIfMissing: false,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existing = await this.findCartItem(cart.id, productId, variantId);

    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: existing.id } });
      return this.mapCart(cart.id);
    }

    const product = await this.pricing.loadSellableProduct(productId, {
      requirePrice: true,
      variantId: existing.variantId,
    });
    this.pricing.assertQuantity(product, quantity);

    await this.prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });

    return this.mapCart(cart.id);
  }

  async removeItem(
    productId: string,
    profileId?: string,
    sessionId?: string,
    variantId?: string,
  ): Promise<CartSummary> {
    const cart = await this.resolveCart({
      profileId,
      sessionId,
      createIfMissing: false,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existing = await this.findCartItem(cart.id, productId, variantId);

    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: existing.id } });
    return this.mapCart(cart.id);
  }

  async updateNotes(
    notes: string | null | undefined,
    profileId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cart = await this.resolveCart({
      profileId,
      sessionId,
      createIfMissing: true,
    });

    if (!cart) {
      throw new BadRequestException('Unable to resolve shopping cart');
    }

    await this.prisma.shoppingCart.update({
      where: { id: cart.id },
      data: { notes: notes ?? null },
    });

    return this.mapCart(cart.id);
  }

  async clearCart(profileId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.resolveCart({
      profileId,
      sessionId,
      createIfMissing: false,
    });

    if (!cart) {
      return emptyCartSummary();
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.mapCart(cart.id);
  }

  async mergeGuestCart(profileId: string, sessionId?: string): Promise<CartSummary> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const customerCart = await this.getOrCreateCustomerCart(customer.id);

    if (!sessionId) {
      return this.mapCart(customerCart.id);
    }

    const guestCart = await this.prisma.shoppingCart.findFirst({
      where: {
        sessionId,
        isActive: true,
        customerId: null,
      },
      include: {
        items: true,
      },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.mapCart(customerCart.id);
    }

    for (const item of guestCart.items) {
      const product = await this.pricing.loadSellableProduct(item.productId, {
        requirePrice: true,
        variantId: item.variantId,
      });

      const existing = await this.prisma.cartItem.findFirst({
        where: {
          cartId: customerCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
      this.pricing.assertQuantity(product, nextQuantity);

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQuantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: customerCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    if (guestCart.notes && !customerCart.notes) {
      await this.prisma.shoppingCart.update({
        where: { id: customerCart.id },
        data: { notes: guestCart.notes },
      });
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await this.prisma.shoppingCart.update({
      where: { id: guestCart.id },
      data: { isActive: false },
    });

    return this.mapCart(customerCart.id);
  }

  /** Used by QuotesModule / OrdersModule when creating from cart. */
  async getActiveCartRecord(profileId?: string, sessionId?: string) {
    if (profileId) {
      const customer = await this.customerContext.assertActiveCustomer(profileId);
      return this.prisma.shoppingCart.findFirst({
        where: {
          customerId: customer.id,
          isActive: true,
        },
        include: cartInclude,
      });
    }

    if (!sessionId) {
      return null;
    }

    this.assertSessionId(sessionId);

    return this.prisma.shoppingCart.findFirst({
      where: {
        sessionId,
        isActive: true,
        customerId: null,
      },
      include: cartInclude,
    });
  }

  async clearCartById(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  private async findCartItem(cartId: string, productId: string, variantId?: string) {
    if (variantId) {
      return this.prisma.cartItem.findFirst({
        where: { cartId, productId, variantId },
      });
    }

    // Prefer an exact null-variant match; fall back to the sole line for this product.
    const nullVariant = await this.prisma.cartItem.findFirst({
      where: { cartId, productId, variantId: null },
    });
    if (nullVariant) {
      return nullVariant;
    }

    const matches = await this.prisma.cartItem.findMany({
      where: { cartId, productId },
      take: 2,
    });

    return matches.length === 1 ? matches[0] : null;
  }

  private async mapCart(cartId: string): Promise<CartSummary> {
    const cart = await this.prisma.shoppingCart.findUniqueOrThrow({
      where: { id: cartId },
      include: cartInclude,
    });

    return toCartSummary(cart, this.pricing);
  }

  private async resolveCart(options: {
    profileId?: string;
    sessionId?: string;
    createIfMissing: boolean;
  }): Promise<ShoppingCart | null> {
    const { profileId, sessionId, createIfMissing } = options;

    if (profileId) {
      const customer = await this.customerContext.assertActiveCustomer(profileId);
      if (createIfMissing) {
        return this.getOrCreateCustomerCart(customer.id);
      }

      return this.prisma.shoppingCart.findFirst({
        where: {
          customerId: customer.id,
          isActive: true,
        },
      });
    }

    if (!sessionId) {
      if (createIfMissing) {
        throw new BadRequestException('X-Cart-Session header is required for guest carts');
      }
      return null;
    }

    this.assertSessionId(sessionId);

    const existing = await this.prisma.shoppingCart.findFirst({
      where: {
        sessionId,
        isActive: true,
        customerId: null,
      },
    });

    if (existing) {
      return existing;
    }

    if (!createIfMissing) {
      return null;
    }

    return this.prisma.shoppingCart.create({
      data: {
        sessionId,
        isActive: true,
      },
    });
  }

  private async getOrCreateCustomerCart(customerId: string): Promise<ShoppingCart> {
    const existing = await this.prisma.shoppingCart.findFirst({
      where: {
        customerId,
        isActive: true,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.shoppingCart.create({
      data: {
        customerId,
        isActive: true,
      },
    });
  }

  private assertSessionId(sessionId: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(sessionId)) {
      throw new BadRequestException('X-Cart-Session must be a valid UUID');
    }
  }

  requireIdentity(profileId?: string, sessionId?: string): void {
    if (!profileId && !sessionId) {
      throw new UnauthorizedException('Authentication or X-Cart-Session is required');
    }
  }
}
