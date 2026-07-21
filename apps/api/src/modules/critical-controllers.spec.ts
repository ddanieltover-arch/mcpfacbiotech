import { AuthController } from './auth/auth.controller';
import { AdminDashboardController } from './admin/admin-dashboard.controller';
import { InvoicesController } from './invoices/invoices.controller';
import { CartController } from './cart/cart.controller';
import { OrdersController } from './orders/orders.controller';
import { QuotesController } from './quotes/quotes.controller';

const user = {
  id: 'p1',
  email: 'a@b.com',
  role: 'CUSTOMER' as const,
  profileId: 'p1',
};

describe('Critical controllers', () => {
  it('AuthController sync + me', async () => {
    const authService = {
      syncProfile: jest.fn().mockResolvedValue(user),
    };
    const controller = new AuthController(authService as never);
    await expect(controller.syncProfile({ id: 'a1' } as never)).resolves.toMatchObject({
      message: 'Profile synced successfully',
    });
    await expect(controller.getMe(user as never)).resolves.toMatchObject({ data: user });
  });

  it('AdminDashboardController.dashboard', async () => {
    const dashboardService = {
      getDashboard: jest.fn().mockResolvedValue({ counts: { products: 1 } }),
    };
    const controller = new AdminDashboardController(dashboardService as never);
    await expect(controller.dashboard()).resolves.toEqual({
      message: 'Admin dashboard retrieved',
      data: { counts: { products: 1 } },
    });
  });

  it('InvoicesController list + getById', async () => {
    const invoicesService = {
      list: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
      getById: jest.fn().mockResolvedValue({ id: 'inv-1' }),
    };
    const controller = new InvoicesController(invoicesService as never);

    await expect(controller.list(user as never, { page: 1, limit: 20 } as never)).resolves.toEqual(
      expect.objectContaining({ message: 'Invoices retrieved' }),
    );
    await expect(controller.getById(user as never, 'inv-1')).resolves.toEqual({
      message: 'Invoice retrieved',
      data: { id: 'inv-1' },
    });
  });

  it('CartController covers guest + auth routes', async () => {
    const cartService = {
      getCart: jest.fn().mockResolvedValue({ id: 'cart-1', items: [] }),
      requireIdentity: jest.fn(),
      addItem: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      updateItem: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      removeItem: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      updateNotes: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      clearCart: jest.fn().mockResolvedValue({ id: 'cart-1', items: [] }),
      mergeGuestCart: jest.fn().mockResolvedValue({ id: 'cart-1' }),
    };
    const controller = new CartController(cartService as never);
    const session = '11111111-1111-4111-8111-111111111111';

    await controller.getCart(undefined, session);
    await controller.addItem({ productId: 'p1', quantity: 1 }, undefined, session);
    await controller.updateItem('p1', { quantity: 2 }, undefined, session);
    await controller.removeItem('p1', undefined, session);
    await controller.updateCart({ notes: 'rush' }, undefined, session);
    await controller.clearCart(undefined, session);
    await controller.merge(user as never, session);

    expect(cartService.mergeGuestCart).toHaveBeenCalledWith('p1', session);
    expect(cartService.requireIdentity).toHaveBeenCalled();
  });

  it('OrdersController list/get/checkout/confirm/cancel', async () => {
    const ordersService = {
      list: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
      getById: jest.fn().mockResolvedValue({ id: 'o1' }),
      checkout: jest.fn().mockResolvedValue({ id: 'o1' }),
      confirm: jest.fn().mockResolvedValue({ id: 'o1' }),
      cancel: jest.fn().mockResolvedValue({ id: 'o1' }),
    };
    const controller = new OrdersController(ordersService as never);

    await controller.list(user as never, { page: 1, limit: 20 } as never);
    await controller.getById(user as never, 'o1');
    await controller.checkout(user as never, undefined, { shippingAddressId: 'a1' } as never);
    await controller.confirm(user as never, 'o1');
    await controller.cancel(user as never, 'o1');

    expect(ordersService.checkout).toHaveBeenCalledWith({
      profileId: 'p1',
      sessionId: undefined,
      dto: { shippingAddressId: 'a1' },
    });
    expect(ordersService.confirm).toHaveBeenCalledWith('p1', 'o1');
  });

  it('QuotesController list/get/create/update/submit', async () => {
    const quotesService = {
      list: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
      getById: jest.fn().mockResolvedValue({ id: 'q1' }),
      create: jest.fn().mockResolvedValue({ id: 'q1' }),
      update: jest.fn().mockResolvedValue({ id: 'q1' }),
      submit: jest.fn().mockResolvedValue({ id: 'q1' }),
    };
    const controller = new QuotesController(quotesService as never);

    await controller.list(user as never, { page: 1, limit: 20 } as never);
    await controller.getById(user as never, 'q1');
    await controller.create(user as never, { fromCart: true } as never);
    await controller.update(user as never, 'q1', { notes: 'n' } as never);
    await controller.submit(user as never, 'q1');

    expect(quotesService.submit).toHaveBeenCalledWith('p1', 'q1');
  });
});
