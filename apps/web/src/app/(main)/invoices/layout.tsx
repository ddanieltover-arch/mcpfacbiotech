import { AccountShell } from '@/components/account/account-shell';

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
