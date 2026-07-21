import type { PrismaClient, UserRole } from '@prisma/client';

const ROLE_DEFINITIONS: { name: UserRole; displayName: string; description: string }[] = [
  { name: 'GUEST', displayName: 'Guest', description: 'Unauthenticated visitor' },
  { name: 'CUSTOMER', displayName: 'Customer', description: 'Registered retail customer' },
  {
    name: 'RESEARCH_CUSTOMER',
    displayName: 'Research Customer',
    description: 'Research institution customer',
  },
  { name: 'DISTRIBUTOR', displayName: 'Distributor', description: 'Authorized distributor' },
  {
    name: 'WHOLESALE_CUSTOMER',
    displayName: 'Wholesale Customer',
    description: 'Wholesale purchasing account',
  },
  { name: 'SUPPORT', displayName: 'Support', description: 'Customer support staff' },
  { name: 'CONTENT_EDITOR', displayName: 'Content Editor', description: 'CMS and blog editor' },
  {
    name: 'INVENTORY_MANAGER',
    displayName: 'Inventory Manager',
    description: 'Product and stock manager',
  },
  { name: 'ADMINISTRATOR', displayName: 'Administrator', description: 'Platform administrator' },
  {
    name: 'SUPER_ADMINISTRATOR',
    displayName: 'Super Administrator',
    description: 'Full platform access',
  },
];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of ROLE_DEFINITIONS) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: role,
      update: {
        displayName: role.displayName,
        description: role.description,
      },
    });
  }
}
