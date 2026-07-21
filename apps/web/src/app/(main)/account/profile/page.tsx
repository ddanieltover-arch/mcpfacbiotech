import type { Metadata } from 'next';
import { AccountProfileClient } from './profile-page-client';

export const metadata: Metadata = {
  title: 'Profile | MCPFAC BIOTECH',
  description: 'Update your customer account profile.',
};

export default function AccountProfilePage() {
  return <AccountProfileClient />;
}
