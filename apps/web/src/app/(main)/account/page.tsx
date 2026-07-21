import type { Metadata } from 'next';
import { AccountDashboardClient } from './account-dashboard-client';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Customer portal dashboard for orders, quotes, and invoices.',
};

export default function AccountPage() {
  return <AccountDashboardClient />;
}
