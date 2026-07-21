'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { AccountProfile } from '@mcpfac/shared-types';
import { getAccountProfile, updateAccountProfile } from '@/lib/commerce-api';

export function AccountProfileClient() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organizationName: '',
    department: '',
    country: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getAccountProfile();
        if (!cancelled) {
          setProfile(data);
          setForm({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone ?? '',
            organizationName: data.organizationName ?? '',
            department: data.department ?? '',
            country: data.country ?? '',
          });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const update =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const updated = await updateAccountProfile(form);
        setProfile(updated);
        toast.success('Profile updated');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Update failed');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Profile</h1>
        <p className="mt-2 text-neutral-600">
          {profile?.email} · {profile?.customerGroup.replaceAll('_', ' ')}
          {profile?.isVerified ? ' · Verified' : ' · Pending verification'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={form.firstName}
            onChange={update('firstName')}
            placeholder="First name"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            required
            value={form.lastName}
            onChange={update('lastName')}
            placeholder="Last name"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={form.phone}
            onChange={update('phone')}
            placeholder="Phone"
            className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={form.organizationName}
            onChange={update('organizationName')}
            placeholder="Organization"
            className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={form.department}
            onChange={update('department')}
            placeholder="Department"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={form.country}
            onChange={update('country')}
            placeholder="Country"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
