import { AccountShell } from '@/components/account/account-shell';

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
