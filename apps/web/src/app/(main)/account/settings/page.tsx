import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Account security and preferences.',
};

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Settings</h1>
        <p className="mt-2 text-neutral-600">
          Security and communication preferences.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <h2 className="font-medium text-neutral-900">Password</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Change your password through the secure reset flow.
          </p>
          <Link
            href="/forgot-password"
            className="mt-3 inline-flex text-sm font-medium text-brand-deep hover:underline"
          >
            Reset password
          </Link>
        </div>
        <div className="border-t border-neutral-100 pt-4">
          <h2 className="font-medium text-neutral-900">Downloads</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Document download center (COA/MSDS) ships in a later milestone. Invoices are
            available now under My Invoices.
          </p>
          <Link
            href="/invoices"
            className="mt-3 inline-flex text-sm font-medium text-brand-deep hover:underline"
          >
            View invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
