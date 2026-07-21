'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { OrderShippingMethod, PaymentMethod } from '@mcpfac/shared-types';
import { PAYMENT_METHOD_OPTIONS, getShippingMethodPrice } from '@mcpfac/shared-types';
import { Alert, Button, Input, Label, Textarea } from '@/components/ui';
import { ShippingMethodSelector } from '@/components/checkout/shipping-method-selector';
import { checkoutOrder } from '@/lib/commerce-api';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') ?? undefined;
  const fromCart = !quoteId;
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const refreshFromServer = useCartStore((s) => s.refreshFromServer);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: '',
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
    paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
    shippingMethod: 'STANDARD' as OrderShippingMethod,
  });

  const selectedPayment = PAYMENT_METHOD_OPTIONS.find((o) => o.value === form.paymentMethod);
  const shippingCost = getShippingMethodPrice(form.shippingMethod);
  const orderTotal = subtotal + shippingCost;
  const isGuest = !authLoading && !user;

  useEffect(() => {
    if (fromCart) {
      void refreshFromServer();
    }
  }, [fromCart, refreshFromServer]);

  useEffect(() => {
    if (quoteId && !authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/checkout?quoteId=${quoteId}`)}`);
    }
  }, [quoteId, authLoading, user, router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (fromCart && items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (isGuest && !form.email.trim()) {
      toast.error('Enter your email so we can send order confirmation');
      return;
    }

    startTransition(async () => {
      try {
        const order = await checkoutOrder({
          fromCart: fromCart || undefined,
          quoteId,
          guestEmail: isGuest ? form.email.trim() : undefined,
          notes: form.notes || undefined,
          purchaseOrderNumber: form.purchaseOrderNumber || undefined,
          paymentMethod: form.paymentMethod,
          shippingMethod: form.shippingMethod,
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

        toast.success(`Order ${order.orderNumber} placed — payment instructions will follow`);

        if (isGuest) {
          router.push(
            `/checkout/confirmation?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(form.email.trim())}`,
          );
        } else {
          router.push(`/orders/${order.id}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Checkout failed');
      }
    });
  };

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              : 'Place an order from your cart. Select how you will pay — we settle manually (no online card capture).'}
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
          {isGuest ? (
            <Alert variant="brand">
              <p className="font-medium text-brand-deep">Checkout as a guest</p>
              <p className="mt-1 text-sm text-neutral-600">
                An account is optional. Create one to track orders, save addresses, and request
                quotes faster — or continue below with your email.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/register?redirect=${encodeURIComponent('/checkout')}`}
                  className="font-semibold text-brand-deep underline-offset-2 hover:underline"
                >
                  Create account
                </Link>
                <Link
                  href={`/login?redirect=${encodeURIComponent('/checkout')}`}
                  className="font-semibold text-brand-natural underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </Alert>
          ) : null}

          {isGuest ? (
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-deep">Contact</h2>
              <div className="mt-4">
                <Label htmlFor="email" isRequired>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="name@lab.org"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  We&apos;ll send order confirmation and payment instructions here.
                </p>
              </div>
            </div>
          ) : null}

          <h2 className="font-heading text-lg font-semibold text-brand-deep">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName" isRequired>
                First name
              </Label>
              <Input id="firstName" required value={form.firstName} onChange={update('firstName')} />
            </div>
            <div>
              <Label htmlFor="lastName" isRequired>
                Last name
              </Label>
              <Input id="lastName" required value={form.lastName} onChange={update('lastName')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="organizationName">Organization</Label>
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={update('organizationName')}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine1" isRequired>
                Address line 1
              </Label>
              <Input
                id="addressLine1"
                required
                value={form.addressLine1}
                onChange={update('addressLine1')}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine2">Address line 2</Label>
              <Input id="addressLine2" value={form.addressLine2} onChange={update('addressLine2')} />
            </div>
            <div>
              <Label htmlFor="city" isRequired>
                City
              </Label>
              <Input id="city" required value={form.city} onChange={update('city')} />
            </div>
            <div>
              <Label htmlFor="stateProvince">State / Province</Label>
              <Input
                id="stateProvince"
                value={form.stateProvince}
                onChange={update('stateProvince')}
              />
            </div>
            <div>
              <Label htmlFor="postalCode" isRequired>
                Postal code
              </Label>
              <Input
                id="postalCode"
                required
                value={form.postalCode}
                onChange={update('postalCode')}
              />
            </div>
            <div>
              <Label htmlFor="country" isRequired>
                Country
              </Label>
              <Input id="country" required value={form.country} onChange={update('country')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={update('phone')} />
            </div>
          </div>

          <ShippingMethodSelector
            value={form.shippingMethod}
            onChange={(shippingMethod) => setForm((prev) => ({ ...prev, shippingMethod }))}
          />

          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-deep">Payment method</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose how you will pay. MCPFAC BIOTECH will send settlement details after the order is
              placed — nothing is charged online at checkout.
            </p>
            <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Payment method</legend>
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const selected = form.paymentMethod === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border px-4 py-3 transition-colors ${
                      selected
                        ? 'border-brand-leaf bg-brand-pale/40 ring-2 ring-brand-leaf/30'
                        : 'border-neutral-200 hover:border-brand-light'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={selected}
                      onChange={() => setForm((prev) => ({ ...prev, paymentMethod: option.value }))}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-brand-deep">{option.label}</span>
                    <span className="mt-1 block text-xs text-neutral-600">{option.description}</span>
                  </label>
                );
              })}
            </fieldset>
            {selectedPayment && (
              <Alert variant="brand" className="mt-3">
                Selected: <strong>{selectedPayment.label}</strong> — instructions for this method are
                emailed after your order is received.
              </Alert>
            )}
          </div>

          <h2 className="font-heading text-lg font-semibold text-brand-deep">Order details</h2>
          <div>
            <Label htmlFor="purchaseOrderNumber">Purchase order number (optional)</Label>
            <Input
              id="purchaseOrderNumber"
              value={form.purchaseOrderNumber}
              onChange={update('purchaseOrderNumber')}
            />
          </div>
          <div>
            <Label htmlFor="notes">Order notes</Label>
            <Textarea id="notes" value={form.notes} onChange={update('notes')} rows={3} />
          </div>
        </div>

        <aside className="h-fit self-start rounded-xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-24">
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
              <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-brand-deep">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-600">
              Product totals come from quote pricing; shipping is added from your selected method.
            </p>
          )}
          <p className="mt-4 text-xs text-neutral-500">
            Pay with: <span className="font-medium text-brand-deep">{selectedPayment?.label}</span>
            {' · '}
            Ship: <span className="font-medium text-brand-deep">{formatCurrency(shippingCost)}</span>
          </p>
          <Button
            type="submit"
            fullWidth
            isLoading={isPending}
            disabled={(fromCart && items.length === 0) || Boolean(quoteId && !user)}
            className="mt-4"
          >
            {isPending ? 'Placing order…' : 'Place Order'}
          </Button>
          <Link
            href={quoteId ? `/quotes/${quoteId}` : '/cart'}
            className="mt-3 block text-center text-sm text-brand-deep hover:underline"
          >
            Back
          </Link>
        </aside>
      </form>
    </div>
  );
}
