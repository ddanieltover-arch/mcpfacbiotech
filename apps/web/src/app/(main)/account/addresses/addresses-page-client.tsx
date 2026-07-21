'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { AddressSummary } from '@mcpfac/shared-types';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from '@/lib/commerce-api';

const EMPTY_FORM = {
  label: '',
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
  isDefault: false,
};

export function AccountAddressesClient() {
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const data = await listAddresses();
    setAddresses(data);
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        const data = await listAddresses();
        if (!cancelled) setAddresses(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load addresses');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'isDefault' ? event.target.checked : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const startEdit = (address: AddressSummary) => {
    setEditingId(address.id);
    setForm({
      label: address.label ?? '',
      firstName: address.firstName,
      lastName: address.lastName,
      organizationName: address.organizationName ?? '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      stateProvince: address.stateProvince ?? '',
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? '',
      isDefault: address.isDefault,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          label: form.label || undefined,
          organizationName: form.organizationName || undefined,
          addressLine2: form.addressLine2 || undefined,
          stateProvince: form.stateProvince || undefined,
          phone: form.phone || undefined,
        };

        if (editingId) {
          await updateAddress(editingId, payload);
          toast.success('Address updated');
        } else {
          await createAddress(payload);
          toast.success('Address added');
        }

        resetForm();
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Save failed');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteAddress(id);
        toast.success('Address deleted');
        if (editingId === id) resetForm();
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Delete failed');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
        Loading addresses…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Addresses</h1>
        <p className="mt-2 text-neutral-600">
          Saved shipping and billing addresses for checkout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              No saved addresses yet.
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {address.label || `${address.firstName} ${address.lastName}`}
                      {address.isDefault && (
                        <span className="ml-2 rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand-deep">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {address.city}
                      {address.stateProvince ? `, ${address.stateProvince}` : ''}{' '}
                      {address.postalCode}
                    </p>
                    <p className="text-sm text-neutral-600">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(address)}
                      className="text-sm text-brand-deep hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-3 rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="font-heading text-lg font-semibold text-brand-deep">
            {editingId ? 'Edit address' : 'Add address'}
          </h2>
          <input
            value={form.label}
            onChange={update('label')}
            placeholder="Label (Lab, Office…)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={form.firstName} onChange={update('firstName')} placeholder="First name" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required value={form.lastName} onChange={update('lastName')} placeholder="Last name" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <input value={form.organizationName} onChange={update('organizationName')} placeholder="Organization" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input required value={form.addressLine1} onChange={update('addressLine1')} placeholder="Address line 1" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input value={form.addressLine2} onChange={update('addressLine2')} placeholder="Address line 2" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={form.city} onChange={update('city')} placeholder="City" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input value={form.stateProvince} onChange={update('stateProvince')} placeholder="State / Province" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required value={form.postalCode} onChange={update('postalCode')} placeholder="Postal code" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
            <input required value={form.country} onChange={update('country')} placeholder="Country" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <input value={form.phone} onChange={update('phone')} placeholder="Phone" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural disabled:opacity-60"
            >
              {isPending ? 'Saving…' : editingId ? 'Update' : 'Add address'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
