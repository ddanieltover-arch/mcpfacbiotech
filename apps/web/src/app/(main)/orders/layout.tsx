import { AccountShell } from '@/components/account/account-shell';

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
