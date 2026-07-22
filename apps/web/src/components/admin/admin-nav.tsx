'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleHelp,
  FileStack,
  FileText,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  Newspaper,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/documents', label: 'Documents', icon: FileStack },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/faq', label: 'FAQ', icon: CircleHelp },
  { href: '/admin/quotes', label: 'Quotes', icon: FileText },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-pale text-brand-deep'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-deep',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
