'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { checkoutOrder } from '@/lib/commerce-api';
import { useCartStore } from '@/stores/cart.store';
import { formatCurrency } from '@/lib/utils';

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') ?? undefined;
  const fromCart = !quoteId;

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const refreshFromServer = useCartStore((s) => s.refreshFromServer);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    organizationName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phone: '',
    purchaseOrderNumber: '',
    notes: '',
    paymentMethod: 'BANK_TRANSFER' as const,
  });

  useEffect(() => {
    if (fromCart) {
      void refreshFromServer();
    }
  }, [fromCart, refreshFromServer]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (fromCart && items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    startTransition(async () => {
      try {
        const order = await checkoutOrder({
          fromCart: fromCart || undefined,
          quoteId,
          notes: form.notes || undefined,
          purchaseOrderNumber: form.purchaseOrderNumber || undefined,
          paymentMethod: form.paymentMethod,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            organizationName: form.organizationName || undefined,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || undefined,
            city: form.city,
            stateProvince: form.stateProvince || undefined,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || undefined,
          },
        });

        if (fromCart) {
          await clearCart().catch(() => undefined);
        }

        toast.success(`Order ${order.orderNumber} placed`);
        router.push(`/orders/${order.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Checkout failed');
      }
    });
  };

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-heading text-4xl font-bold text-brand-deep">Checkout</h1>
          <p className="mt-3 text-neutral-600">
            {quoteId
              ? 'Convert your submitted quote into a pending research order.'
              : 'Place an order from your cart. Prices are recalculated from the live catalog.'}
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="First name" value={form.firstName} onChange={update('firstName')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required placeholder="Last name" value={form.lastName} onChange={update('lastName')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input placeholder="Organization" value={form.organizationName} onChange={update('organizationName')} className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required placeholder="Address line 1" value={form.addressLine1} onChange={update('addressLine1')} className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input placeholder="Address line 2" value={form.addressLine2} onChange={update('addressLine2')} className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required placeholder="City" value={form.city} onChange={update('city')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input placeholder="State / Province" value={form.stateProvince} onChange={update('stateProvince')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required placeholder="Postal code" value={form.postalCode} onChange={update('postalCode')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required placeholder="Country" value={form.country} onChange={update('country')} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={update('phone')} className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <h2 className="font-heading text-lg font-semibold text-brand-deep">Order details</h2>
          <input
            placeholder="Purchase order number (optional)"
            value={form.purchaseOrderNumber}
            onChange={update('purchaseOrderNumber')}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={form.paymentMethod}
            onChange={update('paymentMethod')}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="PURCHASE_ORDER">Purchase order</option>
            <option value="CRYPTO">Cryptocurrency</option>
            <option value="OTHER">Other</option>
          </select>
          <textarea
            placeholder="Order notes"
            value={form.notes}
            onChange={update('notes')}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Summary</h2>
          {fromCart ? (
            <>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-3">
                    <span className="text-neutral-700">
                      {item.productName} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 text-sm font-semibold text-brand-deep">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-600">
              Totals will be taken from quote snapshot pricing on the server.
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || (fromCart && items.length === 0)}
            className="mt-6 w-full rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural disabled:opacity-60"
          >
            {isPending ? 'Placing order…' : 'Place Order'}
          </button>
          <Link href={quoteId ? `/quotes/${quoteId}` : '/cart'} className="mt-3 block text-center text-sm text-brand-deep hover:underline">
            Back
          </Link>
        </aside>
      </form>
    </div>
  );
}
