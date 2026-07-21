import type { Metadata } from 'next';
import { AccountAddressesClient } from './addresses-page-client';

export const metadata: Metadata = {
  title: 'Addresses',
  description: 'Manage saved shipping and billing addresses.',
};

export default function AccountAddressesPage() {
  return <AccountAddressesClient />;
}
